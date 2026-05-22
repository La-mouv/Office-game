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

  it("keeps development recruitment cards as simple buy cards", () => {
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
    expect(html).toContain(worker.description);
    expect(html).not.toContain("Disponible");
    expect(html).not.toContain("Possédés");
    expect(html).not.toContain("Prochain achat");
    expect(html).not.toContain("Production :");
    expect(html).not.toContain("Upgrade");
    expect(html).not.toContain("Niv. 1");
  });

  it("shows the reputation requirement on locked development cards", () => {
    const state = createInitialGameState(0);
    const lockedWorker = state.workers.find((candidate) => candidate.id === "tired-dev")!;
    const lockedLocation = state.locations.find((candidate) => candidate.id === "coffee-machine")!;

    const workerHtml = renderToStaticMarkup(
      <WorkerCard
        worker={lockedWorker}
        reputation={state.resources.reputation}
        budget={state.resources.budget}
        onBuy={vi.fn()}
        onUpgrade={vi.fn()}
      />,
    );
    const locationHtml = renderToStaticMarkup(
      <LocationCard
        location={lockedLocation}
        reputation={state.resources.reputation}
        budget={state.resources.budget}
        onBuyOrUpgrade={vi.fn()}
      />,
    );

    expect(workerHtml).toContain("Débloqué à 40 réputation");
    expect(locationHtml).toContain("Débloqué à 20 réputation");
  });

  it("keeps development layout cards as simple buy cards", () => {
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

    expect(html).toContain(location.description);
    expect(html).toContain("Acheter");
    expect(html).not.toContain("Disponible");
    expect(html).not.toContain("À construire");
    expect(html).not.toContain("Effet :");
    expect(html).not.toContain("Construire");
    expect(html).not.toContain("Niv. 1");
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

  it("does not stack office worker cards either", () => {
    const state = createInitialGameState(0);
    const worker = {
      ...state.workers[0],
      count: 3,
      level: 1,
    };
    const html = renderToStaticMarkup(
      <WorkerCard
        worker={worker}
        reputation={state.resources.reputation}
        budget={state.resources.budget}
        onBuy={vi.fn()}
        onUpgrade={vi.fn()}
        variant="office"
      />,
    );

    expect(html).toContain("office-board-card");
    expect(html).toContain("stack-count-pill");
    expect(html).toContain("stack-count-floating");
    expect(html).not.toContain("office-card-meta-under-badge");
    expect(html).not.toContain("office-stacked-card");
  });

  it("hides the worker count badge for a single office worker", () => {
    const state = createInitialGameState(0);
    const worker = {
      ...state.workers[0],
      count: 1,
      level: 1,
    };
    const html = renderToStaticMarkup(
      <WorkerCard
        worker={worker}
        reputation={state.resources.reputation}
        budget={state.resources.budget}
        onBuy={vi.fn()}
        onUpgrade={vi.fn()}
        variant="office"
      />,
    );

    expect(html).not.toContain("stack-count-pill");
    expect(html).not.toContain("×1");
  });

  it("hides narrative descriptions on office cards but keeps them in the shop", () => {
    const state = createInitialGameState(0);
    const location = {
      ...state.locations.find((candidate) => candidate.id === "coffee-machine")!,
      owned: true,
      level: 1,
    };
    const worker = {
      ...state.workers[0],
      count: 1,
      level: 1,
    };

    const officeLocationHtml = renderToStaticMarkup(
      <LocationCard
        location={location}
        reputation={state.resources.reputation}
        budget={state.resources.budget}
        onBuyOrUpgrade={vi.fn()}
        variant="office"
      />,
    );
    const officeWorkerHtml = renderToStaticMarkup(
      <WorkerCard
        worker={worker}
        reputation={state.resources.reputation}
        budget={state.resources.budget}
        onBuy={vi.fn()}
        onUpgrade={vi.fn()}
        variant="office"
      />,
    );
    const shopWorkerHtml = renderToStaticMarkup(
      <WorkerCard
        worker={worker}
        reputation={state.resources.reputation}
        budget={state.resources.budget}
        onBuy={vi.fn()}
        onUpgrade={vi.fn()}
      />,
    );

    expect(officeLocationHtml).not.toContain(location.description);
    expect(officeWorkerHtml).not.toContain(worker.description);
    expect(shopWorkerHtml).toContain(worker.description);
  });

  it("uses compact stat lines without effect or production labels on office cards only", () => {
    const state = createInitialGameState(0);
    const location = {
      ...state.locations.find((candidate) => candidate.id === "project-room")!,
      owned: true,
      level: 1,
    };
    const worker = {
      ...state.workers[0],
      count: 1,
      level: 1,
    };

    const officeLocationHtml = renderToStaticMarkup(
      <LocationCard
        location={location}
        reputation={state.resources.reputation}
        budget={state.resources.budget}
        onBuyOrUpgrade={vi.fn()}
        variant="office"
      />,
    );
    const officeWorkerHtml = renderToStaticMarkup(
      <WorkerCard
        worker={worker}
        reputation={state.resources.reputation}
        budget={state.resources.budget}
        onBuy={vi.fn()}
        onUpgrade={vi.fn()}
        variant="office"
      />,
    );
    const shopLocationHtml = renderToStaticMarkup(
      <LocationCard
        location={location}
        reputation={state.resources.reputation}
        budget={state.resources.budget}
        onBuyOrUpgrade={vi.fn()}
      />,
    );

    expect(officeLocationHtml).toContain("+30 % idées · +15 % réputation");
    expect(officeLocationHtml).not.toContain("Effet :");
    expect(officeWorkerHtml).not.toContain("Production :");
    expect(shopLocationHtml).not.toContain("Effet :");
  });

  it("keeps office card controls in a compact bottom row", () => {
    const state = createInitialGameState(0);
    const location = {
      ...state.locations.find((candidate) => candidate.id === "coffee-machine")!,
      owned: true,
      level: 2,
    };
    const worker = {
      ...state.workers[0],
      count: 4,
      level: 1,
    };
    const budget = 1_000;
    const reputation = 1_000;

    const locationHtml = renderToStaticMarkup(
      <LocationCard
        location={location}
        reputation={reputation}
        budget={budget}
        onBuyOrUpgrade={vi.fn()}
        variant="office"
      />,
    );
    const workerHtml = renderToStaticMarkup(
      <WorkerCard
        worker={worker}
        reputation={reputation}
        budget={budget}
        onBuy={vi.fn()}
        onUpgrade={vi.fn()}
        variant="office"
      />,
    );

    expect(locationHtml).toContain("office-card-bottom-controls");
    expect(workerHtml).toContain("office-card-bottom-controls");
    expect(workerHtml).toContain("office-card-action");
    expect(workerHtml).not.toContain("sm:grid-cols-2");
    expect(locationHtml).not.toContain(">Améliorer");
    expect(workerHtml).not.toContain(">Améliorer");
  });

  it("uses the green upgrade pictogram for office upgrade buttons", () => {
    const state = createInitialGameState(0);
    const location = {
      ...state.locations.find((candidate) => candidate.id === "coffee-machine")!,
      owned: true,
      level: 2,
    };
    const worker = {
      ...state.workers[0],
      count: 4,
      level: 1,
    };
    const budget = 1_000;
    const reputation = 1_000;

    const locationHtml = renderToStaticMarkup(
      <LocationCard
        location={location}
        reputation={reputation}
        budget={budget}
        onBuyOrUpgrade={vi.fn()}
        variant="office"
      />,
    );
    const workerHtml = renderToStaticMarkup(
      <WorkerCard
        worker={worker}
        reputation={reputation}
        budget={budget}
        onBuy={vi.fn()}
        onUpgrade={vi.fn()}
        variant="office"
      />,
    );

    expect(locationHtml).toContain("%2Fgame-assets%2Fui-upgrade.png");
    expect(workerHtml).toContain("%2Fgame-assets%2Fui-upgrade.png");
    expect(locationHtml).not.toContain("%2Fgame-assets%2Ficon-sparkle.png");
    expect(workerHtml).not.toContain("%2Fgame-assets%2Ficon-sparkle.png");
  });

  it("hides max labels on office cards and removes useless max buttons", () => {
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

    expect(locationHtml).not.toContain(">Max<");
    expect(locationHtml).not.toContain("Niveau max");
    expect(locationHtml).not.toContain("Niv. 1");
    expect(workerHtml).not.toContain(">Max<");
    expect(workerHtml).toContain(">+ ");
    expect(workerHtml).not.toContain("Niv. 5");
    expect(workerHtml).not.toContain(">Max</button>");
    expect(workerHtml).not.toContain("Améliorer");
  });
});
