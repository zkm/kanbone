import type { Model } from "backbone";

type SyncMethod = "create" | "read" | "update" | "patch" | "delete";

interface SyncOptions {
  success?: (resp: unknown) => void;
  error?: (err: unknown) => void;
}

/** Minimal REST-shaped store backed by localStorage, keyed by model id. */
export class LocalStorageStore {
  private readonly key: string;

  constructor(name: string) {
    this.key = `backbone:${name}`;
  }

  private readAll(): Record<string, unknown> {
    const raw = localStorage.getItem(this.key);
    return raw ? JSON.parse(raw) : {};
  }

  private writeAll(records: Record<string, unknown>): void {
    localStorage.setItem(this.key, JSON.stringify(records));
  }

  create(model: Model): unknown {
    if (!model.id) {
      model.set(model.idAttribute, crypto.randomUUID(), { silent: true });
    }
    const records = this.readAll();
    records[String(model.id)] = model.toJSON();
    this.writeAll(records);
    return model.toJSON();
  }

  update(model: Model): unknown {
    const records = this.readAll();
    records[String(model.id)] = model.toJSON();
    this.writeAll(records);
    return model.toJSON();
  }

  find(model: Model): unknown {
    return this.readAll()[String(model.id)];
  }

  findAll(): unknown[] {
    return Object.values(this.readAll());
  }

  destroy(model: Model): unknown {
    const records = this.readAll();
    delete records[String(model.id)];
    this.writeAll(records);
    return model.toJSON();
  }
}

interface HasLocalStorage {
  localStorage?: LocalStorageStore;
  collection?: HasLocalStorage;
}

/**
 * Backbone.sync replacement: no jQuery.ajax / XHR, just a synchronous
 * localStorage store resolved from the model or its collection.
 */
export function localStorageSync(
  method: SyncMethod,
  model: Model & HasLocalStorage,
  options: SyncOptions = {},
): unknown {
  const store = model.localStorage ?? model.collection?.localStorage;
  if (!store) {
    throw new Error("No LocalStorageStore found on model or its collection");
  }

  let resp: unknown;
  try {
    switch (method) {
      case "create":
        resp = store.create(model);
        break;
      case "update":
      case "patch":
        resp = store.update(model);
        break;
      case "delete":
        resp = store.destroy(model);
        break;
      case "read":
        resp = model.id ? store.find(model) : store.findAll();
        break;
    }
  } catch (error) {
    options.error?.(error);
    throw error;
  }

  if (resp !== undefined) {
    options.success?.(resp);
  } else {
    options.error?.(new Error("Record not found"));
  }
  return resp;
}
