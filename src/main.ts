import Backbone from "backbone";
import cash from "cash-dom";
import { Projects } from "./collections/Projects";
import { Tickets } from "./collections/Tickets";
import type { Priority, TicketStatus } from "./lib/board";
import { BoardRouter } from "./router";
import { AppView } from "./views/AppView";

// Backbone.View needs a jQuery-shaped `$` for element wrapping and
// delegated events. cash-dom gives it that in ~6kb, no jQuery required.
Backbone.$ = cash as never;

const projects = new Projects();
const tickets = new Tickets();
projects.fetch();
tickets.fetch();

if (projects.length === 0) {
  seedDemoData(projects, tickets);
}

const appView = new AppView({ el: "#app", projects, tickets });
appView.render();

new BoardRouter(appView);
Backbone.history.start();

interface SeedTicket {
  title: string;
  status: TicketStatus;
  priority: Priority;
  storyPoints: number | null;
  assignee: string;
  labels: string[];
}

function seedDemoData(projects: Projects, tickets: Tickets): void {
  const project = projects.create({ name: "Website Relaunch", color: "#6d5efc" });
  if (!project) return;
  const projectId = project.id;

  const seedTickets: SeedTicket[] = [
    {
      title: "Set up analytics dashboard",
      status: "backlog",
      priority: "low",
      storyPoints: 3,
      assignee: "",
      labels: [],
    },
    {
      title: "Audit third-party scripts for perf",
      status: "backlog",
      priority: "medium",
      storyPoints: 2,
      assignee: "",
      labels: ["perf"],
    },
    {
      title: "Design new pricing page",
      status: "todo",
      priority: "high",
      storyPoints: 5,
      assignee: "Priya",
      labels: ["design"],
    },
    {
      title: "Write onboarding email sequence",
      status: "todo",
      priority: "medium",
      storyPoints: 3,
      assignee: "Priya",
      labels: ["copy"],
    },
    {
      title: "Migrate auth to new provider",
      status: "in_progress",
      priority: "urgent",
      storyPoints: 8,
      assignee: "Sam",
      labels: ["backend", "security"],
    },
    {
      title: "Responsive nav rebuild",
      status: "in_progress",
      priority: "high",
      storyPoints: 5,
      assignee: "Alex",
      labels: ["frontend"],
    },
    {
      title: "Fix checkout total rounding bug",
      status: "review",
      priority: "urgent",
      storyPoints: 2,
      assignee: "Sam",
      labels: ["bug", "payments"],
    },
    {
      title: "Upgrade build tooling to Vite 8",
      status: "done",
      priority: "medium",
      storyPoints: 3,
      assignee: "Alex",
      labels: ["chore"],
    },
  ];

  const orderByStatus = new Map<TicketStatus, number>();
  for (const seed of seedTickets) {
    const order = orderByStatus.get(seed.status) ?? 0;
    orderByStatus.set(seed.status, order + 1);
    tickets.create({ ...seed, projectId, order, description: "" });
  }
}
