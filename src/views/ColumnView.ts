import type { ViewOptions } from "backbone";
import { View } from "backbone";
import type { Tickets } from "../collections/Tickets";
import { COLUMNS, type TicketStatus } from "../lib/board";

interface ColumnViewOptions extends ViewOptions {
  status: TicketStatus;
  tickets: Tickets;
}

export class ColumnView extends View {
  private status: TicketStatus;
  private tickets: Tickets;
  private bodyEl!: HTMLElement;
  private countEl!: HTMLElement;

  constructor(options: ColumnViewOptions) {
    super({
      tagName: "section",
      className: "column",
      events: {
        "dragover .column-body": "onDragOver",
        "drop .column-body": "onDrop",
        "click .add-ticket": "onAddTicket",
      },
      ...options,
    });
    this.status = options.status;
    this.tickets = options.tickets;
  }

  render(): this {
    const el = this.el as HTMLElement;
    const label = COLUMNS.find((c) => c.id === this.status)?.label ?? this.status;
    el.innerHTML = `
      <header class="column-header">
        <h2>${label}</h2>
        <span class="column-count">0</span>
      </header>
      <ul class="column-body"></ul>
      <button type="button" class="add-ticket">+ Add ticket</button>
    `;
    this.bodyEl = el.querySelector(".column-body")!;
    this.countEl = el.querySelector(".column-count")!;
    return this;
  }

  setCards(cardEls: HTMLElement[]): void {
    // appendChild on a node already attached elsewhere detaches it from its
    // old parent automatically, so this is also how cards move between
    // columns when a ticket's status changes (via drag or the detail form).
    for (const cardEl of cardEls) this.bodyEl.appendChild(cardEl);
    this.countEl.textContent = String(cardEls.length);
  }

  private onDragOver(e: DragEvent): void {
    e.preventDefault(); // required every tick, or drop never fires
    const dragging = document.querySelector<HTMLElement>(".card.is-dragging");
    if (!dragging) return;
    const cards = [...this.bodyEl.querySelectorAll<HTMLElement>(".card:not(.is-dragging)")];
    const after = cards.find((card) => {
      const box = card.getBoundingClientRect();
      return e.clientY < box.top + box.height / 2;
    });
    if (after) this.bodyEl.insertBefore(dragging, after);
    else this.bodyEl.appendChild(dragging);
  }

  private onDrop(e: DragEvent): void {
    e.preventDefault();
    const ticketId = e.dataTransfer?.getData("text/plain");
    if (!ticketId) return;
    const orderedIds = [...this.bodyEl.querySelectorAll<HTMLElement>(".card")].map(
      (card) => card.dataset.id!,
    );
    this.tickets.moveTicket(ticketId, this.status, orderedIds);
  }

  private onAddTicket(): void {
    this.trigger("column:addTicket", this.status);
  }
}
