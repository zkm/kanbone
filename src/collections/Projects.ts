import { Collection } from "backbone";
import type { Model } from "backbone";
import { Project } from "../models/Project";
import { LocalStorageStore, localStorageSync } from "../lib/localStorageSync";

export class Projects extends Collection<Project> {
  localStorage = new LocalStorageStore("projects");

  constructor(models?: Project[] | Record<string, unknown>[]) {
    // See Tickets.ts / the original Todos.ts for why `model` must go through
    // super() options rather than a class-field default.
    super(models, { model: Project as unknown as typeof Model });
  }

  sync(method: string, model: this, options?: object): any {
    return localStorageSync(method as never, model as never, options);
  }

  comparator = (project: Project): number => project.get("createdAt") ?? 0;
}
