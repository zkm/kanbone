import { View } from "backbone";
import type { ViewOptions } from "backbone";
import type { Ticket } from "../models/Ticket";
import { PRIORITIES } from "../lib/board";
import { escapeHtml } from "../lib/escapeHtml";

/**
 * Same constructor-timing rule as TodoItemView: tagName/className/attributes
 * must go through super({...options}), not class fields, since View's ctor
 * reads them synchronously before a subclass field initializer would run.
 */
export class TicketCardView extends View<Ticket> {
  constructor(options: ViewOptions<Ticket>) {
    super({
      tagName: "li",
      className: "card",
      attributes: { draggable: "true" },
      events: {
        dragstart: "onDragStart",
        dragend: "onDragEnd",
        click: "onOpen",
      },
      ...options,
    });
  }

  initialize(): void {
    (this.el as HTMLElement).dataset.id = String(this.model.id);
    this.listenTo(this.model, "change", this.render);
    this.listenTo(this.model, "destroy", this.remove);
  }

  render(): this {
    const el = this.el as HTMLElement;
    const title = this.model.get("title") ?? "";
    const priority = this.model.get("priority") ?? "medium";
    const points = this.model.get("storyPoints");
    const assignee = this.model.get("assignee") ?? "";
    const labels = this.model.get("labels") ?? [];
    const priorityLabel = PRIORITIES.find((p) => p.id === priority)?.label ?? priority;

    el.innerHTML = `
      <div class="card-top">
        <span class="badge priority-${priority}">${escapeHtml(priorityLabel)}</span>
        ${points != null ? `<span class="badge points">${points} pt${points === 1 ? "" : "s"}</span>` : ""}
      </div>
      <p class="card-title">${escapeHtml(title)}</p>
      ${
        labels.length
          ? `<div class="card-labels">${labels.map((label) => `<span class="chip">${escapeHtml(label)}</span>`).join("")}</div>`
          : ""
      }
      ${assignee ? `<div class="card-assignee">${escapeHtml(assignee)}</div>` : ""}
    `;
    return this;
  }

  private onDragStart(e: DragEvent): void {
    e.dataTransfer?.setData("text/plain", String(this.model.id));
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
    (this.el as HTMLElement).classList.add("is-dragging");
  }

  private onDragEnd(): void {
    (this.el as HTMLElement).classList.remove("is-dragging");
    // `drop` doesn't fire on a cancelled drag (dropped outside any valid
    // target, or Escape) — this event lets the owner force a re-render from
    // model state so a cancelled drag can't leave the DOM out of sync.
    this.trigger("card:dragend");
  }

  private onOpen(): void {
    this.trigger("card:open", this.model);
  }
}
