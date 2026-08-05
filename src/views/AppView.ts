import type { ViewOptions } from "backbone";
import { View } from "backbone";
import type { Projects } from "../collections/Projects";
import type { Tickets } from "../collections/Tickets";
import { BoardView } from "./BoardView";
import { ProjectSidebarView } from "./ProjectSidebarView";

interface AppViewOptions extends ViewOptions {
  projects: Projects;
  tickets: Tickets;
}

export class AppView extends View {
  private projects: Projects;
  private tickets: Tickets;
  private activeProjectId: string | null = null;
  private shellEl!: HTMLElement;
  private sidebarEl!: HTMLElement;
  private boardEl!: HTMLElement;
  private hamburgerEl!: HTMLElement;
  private sidebarView: ProjectSidebarView | null = null;
  private boardView: BoardView | null = null;

  constructor(options: AppViewOptions) {
    super({
      events: {
        "click .hamburger": "onToggleDrawer",
        "click .sidebar-scrim": "closeDrawer",
        "click .sidebar-slot .project-item": "closeDrawer",
        keydown: "onKeydown",
      },
      ...options,
    });
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
        <header class="mobile-topbar">
          <button type="button" class="hamburger" aria-label="Open menu" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
          <span class="mobile-brand">Kanbone</span>
        </header>
        <div class="sidebar-scrim"></div>
        <div class="sidebar-slot"></div>
        <main class="board-slot"></main>
      </div>
    `;
    this.shellEl = el.querySelector(".app-shell")!;
    this.sidebarEl = el.querySelector(".sidebar-slot")!;
    this.boardEl = el.querySelector(".board-slot")!;
    this.hamburgerEl = el.querySelector(".hamburger")!;

    this.sidebarView = new ProjectSidebarView({
      projects: this.projects,
      activeProjectId: this.activeProjectId ?? "",
    });
    this.sidebarEl.appendChild(this.sidebarView.render().el as HTMLElement);
    return this;
  }

  private onToggleDrawer(): void {
    this.shellEl.classList.toggle("drawer-open");
    this.hamburgerEl.setAttribute(
      "aria-expanded",
      String(this.shellEl.classList.contains("drawer-open")),
    );
  }

  private closeDrawer(): void {
    this.shellEl.classList.remove("drawer-open");
    this.hamburgerEl.setAttribute("aria-expanded", "false");
  }

  private onKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape") this.closeDrawer();
  }
}
