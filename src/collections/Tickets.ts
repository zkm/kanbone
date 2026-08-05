import type { Model } from "backbone";
import { Collection } from "backbone";
import type { TicketStatus } from "../lib/board";
import { LocalStorageStore, localStorageSync } from "../lib/localStorageSync";
import { Ticket, type TicketAttributes } from "../models/Ticket";

export class Tickets extends Collection<Ticket> {
  localStorage = new LocalStorageStore("tickets");

  constructor(models?: Ticket[] | Record<string, unknown>[]) {
    // `model` must reach the base constructor via options: Collection's own
    // constructor can synchronously call reset() (which needs this.model)
    // for any initial `models`, before a TS class-field default would be set.
    super(models, { model: Ticket as unknown as typeof Model });
  }

  // biome-ignore lint/suspicious/noExplicitAny: matches Backbone.Sync's own return type
  sync(method: string, model: this, options?: object): any {
    return localStorageSync(method as never, model as never, options);
  }

  byProject(projectId: string): Ticket[] {
    return this.filter((ticket) => ticket.get("projectId") === projectId);
  }

  byColumn(projectId: string, status: TicketStatus): Ticket[] {
    return this.byProject(projectId)
      .filter((ticket) => ticket.get("status") === status)
      .sort((a, b) => (a.get("order") ?? 0) - (b.get("order") ?? 0));
  }

  /**
   * Only ever called with the final DOM order of a column after a drop, so
   * there's no insertion-index math here: renumber that column 0..n-1 and,
   * for the dragged ticket only, also update its status. The ticket's old
   * column doesn't need renumbering — gaps in `order` are harmless since
   * byColumn only reads relative order within a column.
   */
  moveTicket(ticketId: string, toStatus: TicketStatus, orderedIds: string[]): void {
    orderedIds.forEach((id, index) => {
      const ticket = this.get(id);
      if (!ticket) return;
      const attrs: Partial<TicketAttributes> = { order: index };
      if (id === ticketId) attrs.status = toStatus;
      ticket.save(attrs);
    });
  }
}
