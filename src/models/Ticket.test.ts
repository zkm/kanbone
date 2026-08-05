import { describe, expect, it } from "vitest";
import type { TicketAttributes } from "./Ticket";
import { Ticket } from "./Ticket";

describe("Ticket", () => {
  it("fills in defaults for an unspecified attribute", () => {
    const ticket = new Ticket({ projectId: "p1", title: "Do the thing" } as TicketAttributes);
    expect(ticket.get("status")).toBe("backlog");
    expect(ticket.get("priority")).toBe("medium");
    expect(ticket.get("storyPoints")).toBeNull();
    expect(ticket.get("labels")).toEqual([]);
  });

  it("keeps explicitly provided attributes over defaults", () => {
    const ticket = new Ticket({
      projectId: "p1",
      title: "Do the thing",
      status: "done",
      priority: "urgent",
    } as TicketAttributes);
    expect(ticket.get("status")).toBe("done");
    expect(ticket.get("priority")).toBe("urgent");
  });
});
