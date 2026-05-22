import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { OfficeShopPanel, SkillCard } from "@/components/incremental/OfficeShopPanel";
import { createInitialGameState } from "@/lib/incrementalGame";

describe("OfficeShopPanel", () => {
  it("renders clear development navigation with French tab labels and workers by default", () => {
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
    expect(html).toContain("shop-tabs");
    expect(html).toContain('aria-label="Choisir une catégorie de développement"');
    expect(html).toContain("Recrutement");
    expect(html).toContain("Aménagement");
    expect(html).toContain("Talents");
    expect(html).not.toContain("Upgrades");
    expect(html).toContain("Stagiaire motivé");
  });

  it("renders upgrade cards as simple buy cards too", () => {
    const state = createInitialGameState(0);
    const skill = state.skills[0];
    const html = renderToStaticMarkup(
      <SkillCard skill={skill} state={state} onUnlock={vi.fn()} />,
    );

    expect(html).toContain(skill.description);
    expect(html).toContain(`Acheter ${skill.cost} talent`);
    expect(html).not.toContain("Débloquer");
    expect(html).not.toContain("réputation requise");
  });
});
