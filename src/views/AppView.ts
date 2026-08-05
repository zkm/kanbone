import { View } from "backbone";
import type { ViewOptions } from "backbone";
import { Projects } from "../collections/Projects";
import { Tickets } from "../collections/Tickets";
import { ProjectSidebarView } from "./ProjectSidebarView";
import { BoardView } from "./BoardView";

interface AppViewOptions extends ViewOptions {
  projects: Projects;
  tickets: Tickets;
}

export class AppView extends View {
  private projects: Projects;
  private tickets: Tickets;
  private activeProjectId: string | null = null;
  private sidebarEl!: HTMLElement;
  private boardEl!: HTMLElement;
  private sidebarView: ProjectSidebarView | null = null;
  private boardView: BoardView | null = null;

  constructor(options: AppViewOptions) {
    super({ ...options });
    this.projects = options.projects;
    this.tickets = options.tickets;
  }

  hasProject(projectId: string): boolean {
    return Boolean(this.projects.get(projectId));
  }

  firstProjectId(): string {
    return String(this.projects.first()!.id);
  }

  setActiveProject(projectId: string): void {
    const project = this.projects.get(projectId);
    if (!project) return;
    this.activeProjectId = projectId;
    this.sidebarView?.setActiveProject(projectId);

    this.boardView?.remove();
    this.boardView = new BoardView({ tickets: this.tickets, project });
    this.boardEl.appendChild(this.boardView.render().el as HTMLElement);
  }

  render(): this {
    const el = this.el as HTMLElement;
    el.innerHTML = `
      <div class="app-shell">
        <div class="sidebar-slot"></div>
        <main class="board-slot"></main>
      </div>
    `;
    this.sidebarEl = el.querySelector(".sidebar-slot")!;
    this.boardEl = el.querySelector(".board-slot")!;

    this.sidebarView = new ProjectSidebarView({
      projects: this.projects,
      activeProjectId: this.activeProjectId ?? "",
    });
    this.sidebarEl.appendChild(this.sidebarView.render().el as HTMLElement);
    return this;
  }
}
