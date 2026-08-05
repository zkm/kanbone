import { Model } from "backbone";
import type { Priority, TicketStatus } from "../lib/board";
import { localStorageSync } from "../lib/localStorageSync";

export interface TicketAttributes {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  storyPoints: number | null;
  assignee: string;
  labels: string[];
  order: number;
  createdAt: number;
}

export class Ticket extends Model<TicketAttributes> {
  defaults(): Partial<TicketAttributes> {
    return {
      description: "",
      status: "backlog",
      priority: "medium",
      storyPoints: null,
      assignee: "",
      labels: [],
      createdAt: Date.now(),
    };
  }

  // biome-ignore lint/suspicious/noExplicitAny: matches Backbone.Sync's own return type
  sync(method: string, model: this, options?: object): any {
    return localStorageSync(method as never, model, options);
  }
}
