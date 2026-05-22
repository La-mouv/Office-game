import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function backgroundValue(selector: string): string {
  const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
  const blocks = css
    .split("}")
    .filter((block) => {
      const [rawSelector] = block.split("{");
      return rawSelector?.trim() === selector && block.includes("background:");
    });
  const backgroundLine = blocks.at(-1)?.match(/background:[^;]+;/)?.[0] ?? "";
  return backgroundLine;
}

describe("incident readability", () => {
  it("keeps active incident surfaces opaque for readable text", () => {
    const officeModalBackground = backgroundValue(".incident-scene-modal");
    const incidentPanelBackground = backgroundValue(".incident-card");

    expect(officeModalBackground).not.toContain("rgba(");
    expect(incidentPanelBackground).not.toContain("rgba(");
  });
});
