import { Model } from "backbone";
import { beforeEach, describe, expect, it } from "vitest";
import { LocalStorageStore, localStorageSync } from "./localStorageSync";

class TestModel extends Model {
  localStorage = new LocalStorageStore("test-things");

  // biome-ignore lint/suspicious/noExplicitAny: matches Backbone.Sync's own return type
  sync(method: string, model: this, options?: object): any {
    return localStorageSync(method as never, model, options);
  }
}

describe("LocalStorageStore + localStorageSync", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("assigns an id on create and persists the record", () => {
    const model = new TestModel({ name: "first" });
    model.save();

    expect(model.id).toBeTruthy();
    const store = new LocalStorageStore("test-things");
    expect(store.find(model)).toMatchObject({ name: "first" });
  });

  it("round-trips create, update, find, and destroy", () => {
    const model = new TestModel({ name: "original" });
    model.save();
    const id = model.id;

    model.save({ name: "updated" });
    const store = new LocalStorageStore("test-things");
    expect(store.find(model)).toMatchObject({ name: "updated", id });

    model.destroy();
    expect(store.find(model)).toBeUndefined();
  });

  it("findAll returns every persisted record", () => {
    new TestModel({ name: "a" }).save();
    new TestModel({ name: "b" }).save();

    const store = new LocalStorageStore("test-things");
    expect(store.findAll()).toHaveLength(2);
  });

  it("throws when neither the model nor its collection has a store", () => {
    const bare = new Model({ name: "orphan" });
    expect(() => localStorageSync("create", bare)).toThrow(
      "No LocalStorageStore found on model or its collection",
    );
  });
});
