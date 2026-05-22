import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

function remWidth(selector: string): number {
  const block = css
    .split("}")
    .find((candidate) => candidate.trim().startsWith(selector) && candidate.includes("width:"));
  const width = block?.match(/width:\s*([0-9.]+)rem/)?.[1];
  return width ? Number(width) : Number.POSITIVE_INFINITY;
}

function remGridColumn(selector: string): number {
  const block = css
    .split("}")
    .find(
      (candidate) => candidate.trim().startsWith(selector) && candidate.includes("grid-template-columns:"),
    );
  const column = block?.match(/grid-template-columns:\s*([0-9.]+)rem/)?.[1];
  return column ? Number(column) : Number.POSITIVE_INFINITY;
}

describe("game asset sizing", () => {
  it("keeps icons compact so cards and controls stay readable", () => {
    expect(remWidth(".button-asset-icon")).toBeLessThanOrEqual(1.4);
    expect(remWidth(".resource-pill-asset")).toBeLessThanOrEqual(1.3);
    expect(remGridColumn(".shop-card-hero")).toBeLessThanOrEqual(4.1);
    expect(remWidth(".shop-card-asset")).toBeLessThanOrEqual(4.1);
    expect(remWidth(".quick-action-asset")).toBeLessThanOrEqual(3.4);
    expect(remWidth(".achievement-card-asset")).toBeLessThanOrEqual(3.4);
    expect(remWidth(".incident-title-asset")).toBeLessThanOrEqual(3.4);
  });
});
