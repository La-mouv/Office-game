import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { OfficeView } from "@/components/incremental/OfficeView";
import { MissionTodoPanel } from "@/components/incremental/MissionTodoPanel";
import {
  OfficeShopPanel,
  getDevelopmentLocations,
  getDevelopmentWorkers,
} from "@/components/incremental/OfficeShopPanel";
import { OfficeVillagePreview } from "@/components/incremental/OfficeVillagePreview";
import { buildMissionTodoItems } from "@/lib/incrementalPresentation";
import { calculateProduction, createInitialGameState } from "@/lib/incrementalGame";

describe("office scene integration", () => {
  it("builds a mission todo list with completed missions crossed before the active mission", () => {
    const state = {
      ...createInitialGameState(0),
      log: ["Bienvenue.", "Mission accomplie : Première recrue."],
    };

    const todos = buildMissionTodoItems(state);

    expect(todos[0]).toMatchObject({ title: "Première recrue", completed: true });
    expect(todos.at(-1)).toMatchObject({ title: state.activeMission?.title, completed: false });
  });

  it("keeps incidents and manual actions inside the office scene without the to-do panel or achievement wall", () => {
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
        onBuyWorker={vi.fn()}
        onUpgradeWorker={vi.fn()}
        onBuyOrUpgradeLocation={vi.fn()}
        onUseManualAction={vi.fn()}
        onResolveIncident={vi.fn()}
      />,
    );

    expect(html).not.toContain("To-do");
    expect(html).not.toContain("Missions");
    expect(html).not.toContain("Mur des réussites");
    expect(html).not.toContain("Le bureau grandit");
    expect(html).not.toContain("Sprint équipe");
    expect(html).not.toContain("Actions rapides");
    expect(html).not.toContain("Les petits gestes qui font avancer le bureau.");
    expect(html).toContain("Incident");
    expect(html).toContain("Brainstormer");
    expect(html).toContain("office-action-wall");
    expect(html).not.toContain("office-action-dock");
  });

  it("does not show raw mission progress counters in the to-do panel", () => {
    const state = createInitialGameState(0);
    const html = renderToStaticMarkup(<MissionTodoPanel state={state} now={0} />);

    expect(html).toContain("À faire maintenant");
    expect(html).not.toContain(">0 / 1<");
  });

  it("moves the title chip, resource pills and meters inside the office scene", () => {
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
        onBuyWorker={vi.fn()}
        onUpgradeWorker={vi.fn()}
        onBuyOrUpgradeLocation={vi.fn()}
        onUseManualAction={vi.fn()}
        onResolveIncident={vi.fn()}
      />,
    );

    const officeSceneStart = html.indexOf("office-scene office-breathe");
    const officeFloorStart = html.indexOf("office-floor");

    expect(officeSceneStart).toBeGreaterThanOrEqual(0);
    expect(html.indexOf("game-title-chip")).toBeGreaterThan(officeSceneStart);
    expect(html.indexOf("resource-pill-row")).toBeGreaterThan(officeSceneStart);
    expect(html.indexOf("resource-meter-row")).toBeGreaterThan(officeSceneStart);
    expect(html.indexOf("resource-meter-row")).toBeLessThan(officeFloorStart);
  });

  it("places the incident button between ambiance and chaos meters", () => {
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
        onBuyWorker={vi.fn()}
        onUpgradeWorker={vi.fn()}
        onBuyOrUpgradeLocation={vi.fn()}
        onUseManualAction={vi.fn()}
        onResolveIncident={vi.fn()}
      />,
    );

    const ambianceIndex = html.indexOf("Ambiance");
    const incidentIndex = html.indexOf("resource-incident-slot");
    const chaosIndex = html.indexOf("Chaos");

    expect(incidentIndex).toBeGreaterThan(ambianceIndex);
    expect(incidentIndex).toBeLessThan(chaosIndex);
    expect(html).not.toContain("office-scene-controls");
  });

  it("uses a centered red alarm icon for the incident button", () => {
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
        onBuyWorker={vi.fn()}
        onUpgradeWorker={vi.fn()}
        onBuyOrUpgradeLocation={vi.fn()}
        onUseManualAction={vi.fn()}
        onResolveIncident={vi.fn()}
      />,
    );

    const incidentSlotStart = html.indexOf("resource-incident-slot");
    const incidentSlotEnd = html.indexOf("</button></div>", incidentSlotStart);
    const incidentSlotHtml = html.slice(incidentSlotStart, incidentSlotEnd);

    expect(incidentSlotHtml).toContain("incident-button");
    expect(incidentSlotHtml).toContain("incident-alarm-icon");
    expect(incidentSlotHtml).not.toContain("resource-chaos.png");
  });

  it("shows owned workers and locations as development-style cards inside the office", () => {
    const baseState = createInitialGameState(0);
    const state = {
      ...baseState,
      resources: {
        ...baseState.resources,
        budget: 1_000,
        reputation: 100,
      },
      workers: baseState.workers.map((worker) =>
        worker.id === "intern" ? { ...worker, count: 2 } : worker,
      ),
      locations: baseState.locations.map((location) =>
        location.id === "coffee-machine" ? { ...location, owned: true, level: 2 } : location,
      ),
    };

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
        onBuyWorker={vi.fn()}
        onUpgradeWorker={vi.fn()}
        onBuyOrUpgradeLocation={vi.fn()}
        onUseManualAction={vi.fn()}
        onResolveIncident={vi.fn()}
      />,
    );

    expect(html).toContain("office-board-grid");
    expect(html).toContain("office-board-card");
    expect(html).toContain("Stagiaire motivé");
    expect(html).toContain("Machine à café");
    expect(html).toContain("×2");
    expect(html).toContain(">+ ");
    expect(html).toContain("office-card-bottom-controls");
    expect(html).toContain("office-card-action-icon");
    expect(html).not.toContain(">Améliorer");
    expect(html).not.toContain("office-avatar");
    expect(html).not.toContain("office-object");
  });

  it("removes bought recruitment and layout cards from development", () => {
    const baseState = createInitialGameState(0);
    const state = {
      ...baseState,
      workers: baseState.workers.map((worker) =>
        worker.id === "intern" ? { ...worker, count: 1 } : worker,
      ),
      locations: baseState.locations.map((location) =>
        location.id === "coffee-machine" ? { ...location, owned: true } : location,
      ),
    };

    expect(getDevelopmentWorkers(state.workers, state.resources.reputation).map((worker) => worker.id)).not.toContain(
      "intern",
    );
    expect(getDevelopmentLocations(state.locations, state.resources.reputation).map((location) => location.id)).not.toContain(
      "starting-office",
    );
    expect(getDevelopmentLocations(state.locations, state.resources.reputation).map((location) => location.id)).not.toContain(
      "coffee-machine",
    );

    const html = renderToStaticMarkup(
      <OfficeShopPanel
        state={state}
        onBuyWorker={vi.fn()}
        onUpgradeWorker={vi.fn()}
        onBuyOrUpgradeLocation={vi.fn()}
        onUnlockSkill={vi.fn()}
      />,
    );

    expect(html).not.toContain("Stagiaire motivé");
  });

  it("renders the to-do beside the journal as compact secondary panels", () => {
    const state = {
      ...createInitialGameState(0),
      log: ["Bienvenue.", "Mission accomplie : Première recrue."],
    };
    const html = renderToStaticMarkup(
      <OfficeView
        state={state}
        production={calculateProduction(state)}
        now={0}
        gainBubbles={[]}
        sceneReaction={null}
        onNewGame={vi.fn()}
        onSave={vi.fn()}
        onLoad={vi.fn()}
        onBuyWorker={vi.fn()}
        onUpgradeWorker={vi.fn()}
        onBuyOrUpgradeLocation={vi.fn()}
        onUnlockSkill={vi.fn()}
        onUseManualAction={vi.fn()}
        onResolveIncident={vi.fn()}
      />,
    );

    expect(html).toContain("office-activity-grid");
    expect(html).toContain("To-do");
    expect(html).toContain("Journal");
    expect(html).toContain("mission-todo-done");
  });

  it("removes mission, action and incident panels from below the office scene", () => {
    const state = createInitialGameState(0);
    const html = renderToStaticMarkup(
      <OfficeView
        state={state}
        production={calculateProduction(state)}
        now={0}
        gainBubbles={[]}
        sceneReaction={null}
        onNewGame={vi.fn()}
        onSave={vi.fn()}
        onLoad={vi.fn()}
        onBuyWorker={vi.fn()}
        onUpgradeWorker={vi.fn()}
        onBuyOrUpgradeLocation={vi.fn()}
        onUnlockSkill={vi.fn()}
        onUseManualAction={vi.fn()}
        onResolveIncident={vi.fn()}
      />,
    );

    expect(html).toContain("Journal");
    expect(html).not.toContain("mission-card");
    expect(html).not.toContain("actions-panel");
    expect(html).not.toContain("incident-card");
  });
});
