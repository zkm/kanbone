import { beforeEach, describe, expect, it } from "vitest";
import type { TicketAttributes } from "../models/Ticket";
import { Tickets } from "./Tickets";

describe("Tickets", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function seed(): Tickets {
    const tickets = new Tickets();
    tickets.create({ projectId: "p1", title: "A", status: "todo", order: 0 } as TicketAttributes);
    tickets.create({ projectId: "p1", title: "B", status: "todo", order: 1 } as TicketAttributes);
    tickets.create({ projectId: "p1", title: "C", status: "done", order: 0 } as TicketAttributes);
    tickets.create({ projectId: "p2", title: "D", status: "todo", order: 0 } as TicketAttributes);
    return tickets;
  }

  it("byProject filters to a single project's tickets", () => {
    const tickets = seed();
    expect(tickets.byProject("p1").map((t) => t.get("title"))).toEqual(["A", "B", "C"]);
  });

  it("byColumn filters by project and status, sorted by order", () => {
    const tickets = seed();
    const todo = tickets.byColumn("p1", "todo");
    expect(todo.map((t) => t.get("title"))).toEqual(["A", "B"]);
  });

  it("moveTicket renumbers the destination column and updates the dragged ticket's status", () => {
    const tickets = seed();
    const [a, b] = tickets.byColumn("p1", "todo");
    const c = tickets.byColumn("p1", "done")[0];

    // Drag "B" into the done column, placed before "C".
    tickets.moveTicket(String(b.id), "done", [String(b.id), String(c.id)]);

    expect(b.get("status")).toBe("done");
    expect(b.get("order")).toBe(0);
    expect(c.get("order")).toBe(1);
    // Untouched ticket in the old column keeps its status.
    expect(a.get("status")).toBe("todo");
  });

  it("moveTicket ignores ids that no longer exist in the collection", () => {
    const tickets = seed();
    const [a] = tickets.byColumn("p1", "todo");
    expect(() =>
      tickets.moveTicket(String(a.id), "todo", [String(a.id), "missing-id"]),
    ).not.toThrow();
  });
});
