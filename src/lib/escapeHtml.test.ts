import { describe, expect, it } from "vitest";
import { escapeHtml } from "./escapeHtml";

describe("escapeHtml", () => {
  it("leaves plain text untouched", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });

  it("escapes HTML tag characters", () => {
    expect(escapeHtml("<script>alert(1)</script>")).toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("escapes quote characters used in attribute contexts", () => {
    expect(escapeHtml(`"quoted" and 'single'`)).toBe("&quot;quoted&quot; and &#39;single&#39;");
  });

  it("neutralizes an attribute-breakout attempt", () => {
    const malicious = `" onmouseover="alert(1)`;
    const escaped = escapeHtml(malicious);
    expect(escaped).not.toContain('"');
    expect(escaped).toBe("&quot; onmouseover=&quot;alert(1)");
  });
});
