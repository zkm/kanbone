import { describe, expect, it } from "vitest";
import type { TicketAttributes } from "../models/Ticket";
import { Ticket } from "../models/Ticket";
import { TicketCardView } from "./TicketCardView";

describe("TicketCardView", () => {
  it("renders title, priority, points, labels, and assignee", () => {
    const ticket = new Ticket({
      projectId: "p1",
      title: "Ship it",
      priority: "urgent",
      storyPoints: 5,
      assignee: "Sam",
      labels: ["backend"],
    } as TicketAttributes);
    const view = new TicketCardView({ model: ticket });
    view.render();
    const el = view.el as HTMLElement;

    expect(el.querySelector(".card-title")?.textContent).toBe("Ship it");
    expect(el.querySelector(".priority-urgent")).not.toBeNull();
    expect(el.textContent).toContain("5 pts");
    expect(el.querySelector(".card-assignee")?.textContent).toBe("Sam");
    expect(el.querySelector(".chip")?.textContent).toBe("backend");
  });

  it("escapes untrusted title content", () => {
    const ticket = new Ticket({
      projectId: "p1",
      title: `<img src=x onerror="alert(1)">`,
    } as TicketAttributes);
    const view = new TicketCardView({ model: ticket });
    view.render();

    expect((view.el as HTMLElement).querySelector(".card-title img")).toBeNull();
  });

  it("re-renders when the underlying model changes", () => {
    const ticket = new Ticket({ projectId: "p1", title: "Before" } as TicketAttributes);
    const view = new TicketCardView({ model: ticket });
    view.render();

    ticket.set("title", "After");
    expect((view.el as HTMLElement).querySelector(".card-title")?.textContent).toBe("After");
  });

  it("triggers card:open on click", () => {
    const ticket = new Ticket({ projectId: "p1", title: "Click me" } as TicketAttributes);
    const view = new TicketCardView({ model: ticket });
    view.render();

    let opened: Ticket | undefined;
    view.on("card:open", (t: Ticket) => {
      opened = t;
    });
    (view.el as HTMLElement).dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(opened).toBe(ticket);
  });
});
