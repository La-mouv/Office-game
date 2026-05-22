import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { OfficeView } from "@/components/incremental/OfficeView";
import { calculateProduction, createInitialGameState } from "@/lib/incrementalGame";
import { localizeGameState } from "@/lib/gameTranslations";

describe("game translations", () => {
  it("localizes core game data and current mission copy in English and Spanish", () => {
    const state = createInitialGameState(0);
    const english = localizeGameState(state, "en");
    const spanish = localizeGameState(state, "es");

    expect(english.workers.find((worker) => worker.id === "intern")?.name).toBe("Motivated intern");
    expect(english.locations.find((location) => location.id === "coffee-machine")?.name).toBe("Coffee machine");
    expect(english.manualActions.find((action) => action.id === "coffee-break")?.name).toBe("Coffee break");
    expect(english.activeMission?.title).toBe("First hire");
    expect(english.activeMission?.description).toBe(
      "Recruit the first pair of hands before planning turns into a crisis committee.",
    );
    expect(english.log[0]).toBe(
      "Welcome to Office Village. The open office is still breathing; chaos is already asking for a badge.",
    );

    expect(spanish.workers.find((worker) => worker.id === "intern")?.name).toBe("Becario motivado");
    expect(spanish.locations.find((location) => location.id === "coffee-machine")?.name).toBe("Máquina de café");
    expect(spanish.manualActions.find((action) => action.id === "coffee-break")?.name).toBe("Pausa café");
    expect(spanish.activeMission?.title).toBe("Primera contratación");
    expect(spanish.activeMission?.description).toBe(
      "Recluta el primer par de manos antes de que la planificación se vuelva comité de crisis.",
    );
    expect(spanish.log[0]).toBe(
      "Bienvenido a Office Village. El open space aún respira; el caos ya está pidiendo una tarjeta de acceso.",
    );
  });

  it("renders the active game surface with the selected language", () => {
    const state = createInitialGameState(0);
    const englishState = localizeGameState(state, "en");
    const spanishState = localizeGameState(state, "es");

    const englishHtml = renderToStaticMarkup(
      <OfficeView
        language="en"
        state={englishState}
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

    expect(englishHtml).toContain("Development");
    expect(englishHtml).toContain("Recruitment");
    expect(englishHtml).toContain("Do now");
    expect(englishHtml).toContain("Reward:");
    expect(englishHtml).toContain("Hire 10 €");
    expect(englishHtml).not.toContain("Récompense");

    const spanishHtml = renderToStaticMarkup(
      <OfficeView
        language="es"
        state={spanishState}
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

    expect(spanishHtml).toContain("Desarrollo");
    expect(spanishHtml).toContain("Contratación");
    expect(spanishHtml).toContain("Hacer ahora");
    expect(spanishHtml).toContain("Recompensa:");
    expect(spanishHtml).toContain("Contratar 10 €");
    expect(spanishHtml).not.toContain("Récompense");
  });
});
