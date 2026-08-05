import type { ViewOptions } from "backbone";
import { View } from "backbone";
import type { Projects } from "../collections/Projects";

const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const DEFAULT_COLOR = "#6d5efc";

interface ProjectFormViewOptions extends ViewOptions {
  projects: Projects;
}

export class ProjectFormView extends View {
  private projects: Projects;

  constructor(options: ProjectFormViewOptions) {
    super({
      tagName: "div",
      className: "modal-overlay",
      events: {
        click: "onBackdropClick",
        "submit form": "onSubmit",
        "click .cancel": "onCancel",
      },
      ...options,
    });
    this.projects = options.projects;
  }

  render(): this {
    const el = this.el as HTMLElement;
    el.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <form>
          <label>Project name
            <input name="name" required autofocus />
          </label>
          <label>Color
            <input name="color" type="color" value="${DEFAULT_COLOR}" />
          </label>
          <div class="modal-actions">
            <button type="button" class="cancel">Cancel</button>
            <button type="submit">Create</button>
          </div>
        </form>
      </div>
    `;
    return this;
  }

  // See TicketDetailView.focusTitleInput — autofocus doesn't reliably fire
  // for elements inserted via innerHTML after the fact.
  focusNameInput(): void {
    (this.el as HTMLElement).querySelector<HTMLInputElement>('input[name="name"]')?.focus();
  }

  private onBackdropClick(e: MouseEvent): void {
    if (e.target === this.el) this.trigger("form:cancel");
  }

  private onCancel(): void {
    this.trigger("form:cancel");
  }

  private onSubmit(e: SubmitEvent): void {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const name = String(data.get("name") ?? "").trim();
    if (!name) return;
    const colorRaw = String(data.get("color") ?? "");
    const color = HEX_COLOR.test(colorRaw) ? colorRaw : DEFAULT_COLOR;
    const project = this.projects.create({ name, color });
    if (project) this.trigger("project:created", project.id);
  }
}
