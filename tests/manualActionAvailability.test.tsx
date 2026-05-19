import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ManualActionsPanel } from "@/components/incremental/ManualActionsPanel";
import { createInitialGameState, useManualAction } from "@/lib/incrementalGame";

describe("pause café availability", () => {
  it("locks pause café until the coffee machine exists", () => {
    const state = createInitialGameState(0);
    const html = renderToStaticMarkup(
      <ManualActionsPanel
        actions={state.manualActions}
        resources={state.resources}
        locations={state.locations}
        now={0}
        onUse={vi.fn()}
      />,
    );

    expect(html).toContain("Machine à café requise");
  });

  it("does not apply pause café before the coffee machine is built", () => {
    const state = createInitialGameState(0);
    const next = useManualAction(state, "coffee-break", 1000);

    expect(next.resources.ambiance).toBe(state.resources.ambiance);
    expect(next.log.at(-1)).toBe("Machine à café requise pour Pause café.");
  });
});
