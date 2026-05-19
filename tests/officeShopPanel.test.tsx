import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { OfficeShopPanel } from "@/components/incremental/OfficeShopPanel";
import { createInitialGameState } from "@/lib/incrementalGame";

describe("OfficeShopPanel", () => {
  it("renders the compact shop with all three tab labels and workers by default", () => {
    const html = renderToStaticMarkup(
      <OfficeShopPanel
        state={createInitialGameState(0)}
        onBuyWorker={vi.fn()}
        onUpgradeWorker={vi.fn()}
        onBuyOrUpgradeLocation={vi.fn()}
        onUnlockSkill={vi.fn()}
      />,
    );

    expect(html).toContain("Développement");
    expect(html).toContain("Recrutement");
    expect(html).toContain("Aménagement");
    expect(html).toContain("Upgrades");
    expect(html).toContain("Stagiaire motivé");
  });
});
