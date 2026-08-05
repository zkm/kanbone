import type { ViewOptions } from "backbone";
import { View } from "backbone";
import type { Tickets } from "../collections/Tickets";
import { COLUMNS, type TicketStatus } from "../lib/board";
import type { Project } from "../models/Project";
import { Ticket, type TicketAttributes } from "../models/Ticket";
import { ColumnView } from "./ColumnView";
import { TicketCardView } from "./TicketCardView";
import { TicketDetailView } from "./TicketDetailView";

interface BoardViewOptions extends ViewOptions {
  tickets: Tickets;
  project: Project;
}

export class BoardView extends View {
  private tickets: Tickets;
  private project: Project;
  private columnViews = new Map<TicketStatus, ColumnView>();
  private cardViews = new Map<string, TicketCardView>();
  private detailView: TicketDetailView | null = null;

  constructor(options: BoardViewOptions) {
    super({ className: "board", ...options });
    this.tickets = options.tickets;
    this.project = options.project;
    this.listenTo(this.tickets, "add remove reset change:status change:order", this.renderCards);
  }

  render(): this {
    const el = this.el as HTMLElement;
    el.innerHTML = "";
    for (const column of COLUMNS) {
      const columnView = new ColumnView({ status: column.id, tickets: this.tickets });
      this.listenTo(columnView, "column:addTicket", this.openNewTicket);
      this.columnViews.set(column.id, columnView);
      el.appendChild(columnView.render().el as HTMLElement);
    }
    this.renderCards();
    return this;
  }

  remove(): this {
    this.detailView?.remove();
    return super.remove();
  }

  private renderCards(): void {
    const visibleIds = new Set<string>();
    for (const column of COLUMNS) {
      const ticketsInColumn = this.tickets.byColumn(String(this.project.id), column.id);
      const cardEls: HTMLElement[] = [];
      for (const ticket of ticketsInColumn) {
        const ticketId = String(ticket.id);
        visibleIds.add(ticketId);
        let view = this.cardViews.get(ticketId);
        if (!view) {
          view = new TicketCardView({ model: ticket });
          this.listenTo(view, "card:open", this.openTicket);
          this.listenTo(view, "card:dragend", this.renderCards);
          this.cardViews.set(ticketId, view);
        }
        cardEls.push(view.render().el as HTMLElement);
      }
      this.columnViews.get(column.id)?.setCards(cardEls);
    }
    for (const [id, view] of this.cardViews) {
      if (!visibleIds.has(id)) {
        view.remove();
        this.cardViews.delete(id);
      }
    }
  }

  private openTicket(ticket: Ticket): void {
    this.showDetail(new TicketDetailView({ model: ticket, tickets: this.tickets }));
  }

  private openNewTicket(status: TicketStatus): void {
    const projectId = String(this.project.id);
    const order = this.tickets.byColumn(projectId, status).length;
    // Scratch model only — defaults() fills the rest at runtime; never
    // persisted directly (see TicketDetailView.onSubmit's isNew branch).
    const ticket = new Ticket({ projectId, status, order } as TicketAttributes);
    this.showDetail(new TicketDetailView({ model: ticket, tickets: this.tickets, isNew: true }));
  }

  private showDetail(view: TicketDetailView): void {
    this.detailView?.remove();
    this.detailView = view;
    document.body.appendChild(view.render().el as HTMLElement);
    view.focusTitleInput();
    this.listenTo(view, "detail:close", () => {
      view.remove();
      if (this.detailView === view) this.detailView = null;
    });
  }
}
