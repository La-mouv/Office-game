import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

function cssBlock(selector: string): string {
  return (
    css
      .split("}")
      .find((candidate) => candidate.trim().startsWith(selector))
      ?.trim() ?? ""
  );
}

describe("office board card sizing", () => {
  it("forces every card on the office board to share the same fixed size", () => {
    const cardBlock = cssBlock(".office-board-card");
    const controlsBlock = cssBlock(".office-card-bottom-controls");
    const actionBlock = cssBlock(".office-card-action");

    expect(cardBlock).toContain("height: 12.5rem");
    expect(cardBlock).toContain("display: grid");
    expect(cardBlock).toContain("grid-template-rows: auto auto minmax(0, 1fr)");
    expect(cardBlock).toContain("overflow: visible");
    expect(controlsBlock).toContain("position: absolute");
    expect(controlsBlock).toContain("right: 0.85rem");
    expect(controlsBlock).toContain("bottom: 0.85rem");
    expect(controlsBlock).toContain("grid-template-columns: repeat(2, minmax(0, 1fr))");
    expect(actionBlock).toContain("min-height: 3rem");
  });

  it("lets the worker count badge sit over the top right card corner", () => {
    const badgeBlock = cssBlock(".stack-count-floating");

    expect(badgeBlock).toContain("top: -0.7rem");
    expect(badgeBlock).toContain("right: -0.7rem");
    expect(badgeBlock).toContain("z-index: 5");
  });
});
