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

  sync(method: string, model: this, options?: object): any {
    return localStorageSync(method as never, model, options);
  }
}
