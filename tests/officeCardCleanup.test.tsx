import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LocationCard } from "@/components/incremental/LocationCard";
import { OfficeVillagePreview } from "@/components/incremental/OfficeVillagePreview";
import { WorkerCard } from "@/components/incremental/WorkerCard";
import { calculateProduction, createInitialGameState } from "@/lib/incrementalGame";

describe("office card cleanup", () => {
  it("does not show the owned-location count pill in the office scene header", () => {
    const state = createInitialGameState(0);
    const html = renderToStaticMarkup(
      <OfficeVillagePreview
        state={state}
        production={calculateProduction(state)}
        now={0}
        gainBubbles={[]}
        sceneReaction={null}
        onNewGame={vi.fn()}
        onSave={vi.fn()}
        onLoad={vi.fn()}
        onUseManualAction={vi.fn()}
        onResolveIncident={vi.fn()}
      />,
    );

    expect(html).not.toContain("1 lieux");
    expect(html).not.toContain("3 lieux");
  });

  it("keeps recruitment cards compact with the buy price directly on the button", () => {
    const state = createInitialGameState(0);
    const worker = state.workers[0];
    const html = renderToStaticMarkup(
      <WorkerCard
        worker={worker}
        reputation={state.resources.reputation}
        budget={state.resources.budget}
        onBuy={vi.fn()}
        onUpgrade={vi.fn()}
      />,
    );

    expect(html).toContain("Acheter 10 €");
    expect(html).not.toContain("Disponible");
    expect(html).not.toContain("Possédés");
    expect(html).not.toContain("Prochain achat");
  });

  it("removes available and build-status pills from layout cards", () => {
    const state = createInitialGameState(0);
    const location = state.locations.find((candidate) => !candidate.owned)!;
    const html = renderToStaticMarkup(
      <LocationCard
        location={location}
        reputation={state.resources.reputation}
        budget={state.resources.budget}
        onBuyOrUpgrade={vi.fn()}
      />,
    );

    expect(html).not.toContain("Disponible");
    expect(html).not.toContain("À construire");
  });

  it("does not stack office layout cards", () => {
    const state = createInitialGameState(0);
    const location = {
      ...state.locations.find((candidate) => candidate.id === "coffee-machine")!,
      owned: true,
      level: 2,
    };
    const html = renderToStaticMarkup(
      <LocationCard
        location={location}
        reputation={state.resources.reputation}
        budget={state.resources.budget}
        onBuyOrUpgrade={vi.fn()}
        variant="office"
      />,
    );

    expect(html).toContain("office-board-card");
    expect(html).not.toContain("office-stacked-card");
  });

  it("shows max as the level label and removes the useless max button", () => {
    const state = createInitialGameState(0);
    const location = {
      ...state.locations.find((candidate) => candidate.id === "starting-office")!,
      owned: true,
      level: 1,
      maxLevel: 1,
    };
    const worker = {
      ...state.workers[0],
      count: 1,
      level: 5,
    };
    const budget = 1_000;

    const locationHtml = renderToStaticMarkup(
      <LocationCard
        location={location}
        reputation={state.resources.reputation}
        budget={budget}
        onBuyOrUpgrade={vi.fn()}
        variant="office"
      />,
    );
    const workerHtml = renderToStaticMarkup(
      <WorkerCard
        worker={worker}
        reputation={state.resources.reputation}
        budget={budget}
        onBuy={vi.fn()}
        onUpgrade={vi.fn()}
        variant="office"
      />,
    );

    expect(locationHtml).toContain(">Max<");
    expect(locationHtml).not.toContain("Niveau max");
    expect(locationHtml).not.toContain("Niv. 1");
    expect(workerHtml).toContain(">Max<");
    expect(workerHtml).toContain(">+ ");
    expect(workerHtml).not.toContain("Niv. 5");
    expect(workerHtml).not.toContain(">Max</button>");
    expect(workerHtml).not.toContain("Améliorer");
  });
});
