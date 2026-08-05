import type { RouterOptions } from "backbone";
import { Router } from "backbone";
import type { AppView } from "./views/AppView";

export class BoardRouter extends Router {
  private appView: AppView;

  constructor(appView: AppView, options?: RouterOptions) {
    super({
      routes: {
        "project/:id": "showProject",
        "*default": "showDefault",
      },
      ...options,
    });
    this.appView = appView;
  }

  private showProject(id: string): void {
    if (!this.appView.hasProject(id)) {
      this.showDefault();
      return;
    }
    this.appView.setActiveProject(id);
  }

  private showDefault(): void {
    this.navigate(`project/${this.appView.firstProjectId()}`, { trigger: true, replace: true });
  }
}
