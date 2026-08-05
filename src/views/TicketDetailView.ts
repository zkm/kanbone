import type { ViewOptions } from "backbone";
import { View } from "backbone";
import type { Tickets } from "../collections/Tickets";
import { COLUMNS, PRIORITIES, type Priority, type TicketStatus } from "../lib/board";
import { escapeHtml } from "../lib/escapeHtml";
import type { Ticket, TicketAttributes } from "../models/Ticket";

const ESCAPE_KEY = "Escape";

interface TicketDetailViewOptions extends ViewOptions<Ticket> {
  tickets: Tickets;
  isNew?: boolean;
}

export class TicketDetailView extends View<Ticket> {
  private tickets: Tickets;
  private isNew: boolean;

  constructor(options: TicketDetailViewOptions) {
    super({
      tagName: "div",
      className: "modal-overlay",
      events: {
        click: "onBackdropClick",
        keydown: "onKeydown",
        "submit form": "onSubmit",
        "click .cancel": "onCancel",
        "click .delete": "onDelete",
      },
      ...options,
    });
    this.tickets = options.tickets;
    this.isNew = options.isNew ?? false;
  }

  render(): this {
    const el = this.el as HTMLElement;
    const title = this.model.get("title") ?? "";
    const description = this.model.get("description") ?? "";
    const status = this.model.get("status") ?? "backlog";
    const priority = this.model.get("priority") ?? "medium";
    const storyPoints = this.model.get("storyPoints");
    const assignee = this.model.get("assignee") ?? "";
    const labels = this.model.get("labels") ?? [];

    el.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <form>
          <label>Title
            <input name="title" value="${escapeHtml(title)}" required autofocus />
          </label>
          <label>Description
            <textarea name="description" rows="3">${escapeHtml(description)}</textarea>
          </label>
          <div class="modal-row">
            <label>Status
              <select name="status">
                ${COLUMNS.map((c) => `<option value="${c.id}" ${c.id === status ? "selected" : ""}>${c.label}</option>`).join("")}
              </select>
            </label>
            <label>Priority
              <select name="priority">
                ${PRIORITIES.map((p) => `<option value="${p.id}" ${p.id === priority ? "selected" : ""}>${p.label}</option>`).join("")}
              </select>
            </label>
          </div>
          <div class="modal-row">
            <label>Story points
              <input name="storyPoints" type="number" min="0" step="1" value="${storyPoints ?? ""}" />
            </label>
            <label>Assignee
              <input name="assignee" value="${escapeHtml(assignee)}" />
            </label>
          </div>
          <label>Labels
            <input name="labels" value="${escapeHtml(labels.join(", "))}" placeholder="comma, separated" />
          </label>
          <div class="modal-actions">
            ${this.isNew ? "" : `<button type="button" class="delete">Delete</button>`}
            <button type="button" class="cancel">Cancel</button>
            <button type="submit" class="save">${this.isNew ? "Add ticket" : "Save"}</button>
          </div>
        </form>
      </div>
    `;
    return this;
  }

  /**
   * `autofocus` doesn't reliably fire for elements inserted via innerHTML
   * after the fact, and the modal's Escape/keydown handling relies on focus
   * being inside it — call this once the element is attached to the DOM.
   */
  focusTitleInput(): void {
    (this.el as HTMLElement).querySelector<HTMLInputElement>('input[name="title"]')?.focus();
  }

  private onBackdropClick(e: MouseEvent): void {
    if (e.target === this.el) this.close();
  }

  private onKeydown(e: KeyboardEvent): void {
    if (e.key === ESCAPE_KEY) this.close();
  }

  private onCancel(): void {
    this.close();
  }

  private onSubmit(e: SubmitEvent): void {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const title = String(data.get("title") ?? "").trim();
    if (!title) return;

    const status = String(data.get("status")) as TicketStatus;
    const projectId = this.model.get("projectId")!;
    // Append to the end of the destination column, whether that's because
    // this is a new ticket or the status changed via the select.
    const order = this.tickets
      .byColumn(projectId, status)
      .filter((t) => t.id !== this.model.id).length;
    const storyPointsRaw = String(data.get("storyPoints") ?? "").trim();
    const labels = String(data.get("labels") ?? "")
      .split(",")
      .map((label) => label.trim())
      .filter(Boolean);

    const attrs: Partial<TicketAttributes> = {
      title,
      description: String(data.get("description") ?? "").trim(),
      status,
      priority: String(data.get("priority")) as Priority,
      storyPoints: storyPointsRaw ? Number(storyPointsRaw) : null,
      assignee: String(data.get("assignee") ?? "").trim(),
      labels,
      order,
    };

    if (this.isNew) {
      this.tickets.create({ ...this.model.attributes, ...attrs });
    } else {
      this.model.save(attrs);
    }
    this.close();
  }

  private onDelete(): void {
    this.model.destroy();
    this.close();
  }

  private close(): void {
    this.trigger("detail:close");
  }
}
