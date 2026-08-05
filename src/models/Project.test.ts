import { describe, expect, it } from "vitest";
import type { ProjectAttributes } from "./Project";
import { Project } from "./Project";

describe("Project", () => {
  it("defaults to the brand color when none is given", () => {
    const project = new Project({ name: "Untitled" } as ProjectAttributes);
    expect(project.get("color")).toBe("#6d5efc");
  });

  it("keeps an explicitly provided color", () => {
    const project = new Project({ name: "Untitled", color: "#ff0000" } as ProjectAttributes);
    expect(project.get("color")).toBe("#ff0000");
  });

  it("stamps a createdAt timestamp", () => {
    const before = Date.now();
    const project = new Project({ name: "Untitled" } as ProjectAttributes);
    expect(project.get("createdAt")).toBeGreaterThanOrEqual(before);
  });
});
