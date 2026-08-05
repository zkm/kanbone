import { View } from "backbone";
import type { ViewOptions } from "backbone";
import type { Projects } from "../collections/Projects";
import { escapeHtml } from "../lib/escapeHtml";
import { ProjectFormView } from "./ProjectFormView";

interface ProjectSidebarViewOptions extends ViewOptions {
  projects: Projects;
  activeProjectId: string;
}

export class ProjectSidebarView extends View {
  private projects: Projects;
  private activeProjectId: string;
  private formView: ProjectFormView | null = null;

  constructor(options: ProjectSidebarViewOptions) {
    super({
      tagName: "aside",
      className: "sidebar",
      events: {
        "click .new-project-btn": "onNewProject",
      },
      ...options,
    });
    this.projects = options.projects;
    this.activeProjectId = options.activeProjectId;
    this.listenTo(this.projects, "add remove reset change", this.render);
  }

  setActiveProject(projectId: string): void {
    this.activeProjectId = projectId;
    this.render();
  }

  remove(): this {
    this.formView?.remove();
    return super.remove();
  }

  render(): this {
    const el = this.el as HTMLElement;
    el.innerHTML = `
      <h1 class="brand">Kanbone</h1>
      <ul class="project-list">
        ${this.projects
          .map(
            (project) => `
          <li>
            <a class="project-item ${project.id === this.activeProjectId ? "active" : ""}" href="#/project/${project.id}">
              <span class="swatch" data-swatch="${project.id}"></span>
              ${escapeHtml(project.get("name") ?? "")}
            </a>
          </li>`,
          )
          .join("")}
      </ul>
      <button type="button" class="new-project-btn">+ New project</button>
    `;
    for (const project of this.projects.models) {
      const swatch = el.querySelector<HTMLElement>(`[data-swatch="${project.id}"]`);
      if (swatch) swatch.style.background = project.get("color") ?? "#6d5efc";
    }
    return this;
  }

  private onNewProject(): void {
    this.formView?.remove();
    const formView = new ProjectFormView({ projects: this.projects });
    this.formView = formView;
    this.listenTo(formView, "project:created", (id: string) => {
      formView.remove();
      if (this.formView === formView) this.formView = null;
      window.location.hash = `#/project/${id}`;
    });
    this.listenTo(formView, "form:cancel", () => {
      formView.remove();
      if (this.formView === formView) this.formView = null;
    });
    document.body.appendChild(formView.render().el as HTMLElement);
    formView.focusNameInput();
  }
}
