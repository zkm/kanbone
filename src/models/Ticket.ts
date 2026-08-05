import { Model } from "backbone";
import { localStorageSync } from "../lib/localStorageSync";
import type { TicketStatus, Priority } from "../lib/board";

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

  sync(method: string, model: this, options?: object): any {
    return localStorageSync(method as never, model, options);
  }
}
