import { Model } from "backbone";
import { localStorageSync } from "../lib/localStorageSync";

export interface ProjectAttributes {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export class Project extends Model<ProjectAttributes> {
  defaults(): Partial<ProjectAttributes> {
    return { color: "#6d5efc", createdAt: Date.now() };
  }

  // biome-ignore lint/suspicious/noExplicitAny: matches Backbone.Sync's own return type
  sync(method: string, model: this, options?: object): any {
    return localStorageSync(method as never, model, options);
  }
}
