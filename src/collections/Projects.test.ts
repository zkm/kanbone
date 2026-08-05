import { beforeEach, describe, expect, it } from "vitest";
import type { ProjectAttributes } from "../models/Project";
import { Projects } from "./Projects";

describe("Projects", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("orders projects by creation time", () => {
    const projects = new Projects();
    const first = projects.create({ name: "First", createdAt: 1 } as ProjectAttributes)!;
    const second = projects.create({ name: "Second", createdAt: 2 } as ProjectAttributes)!;
    // Re-add out of order to make sure the comparator, not insertion order, drives sort.
    projects.reset([second, first]);
    expect(projects.map((p) => p.get("name"))).toEqual(["First", "Second"]);
  });

  it("persists created projects to localStorage", () => {
    const projects = new Projects();
    projects.create({ name: "Persisted" } as ProjectAttributes);

    const reloaded = new Projects();
    reloaded.fetch();
    expect(reloaded.map((p) => p.get("name"))).toEqual(["Persisted"]);
  });
});
