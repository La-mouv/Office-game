import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ManualActionsPanel } from "@/components/incremental/ManualActionsPanel";
import { createInitialGameState } from "@/lib/incrementalGame";

describe("ManualActionsPanel", () => {
  it("keeps only the icon, effect lines, and action name inside the button", () => {
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

    expect(html).toContain("Brainstormer");
    expect(html).toContain("Machine à café requise");
    expect(html).toContain("Pitch client");
    expect(html).not.toContain("Sprint équipe");
    expect(html).not.toContain("Sans coût");
    expect(html).not.toContain("Coût :");
    expect(html).not.toContain("Gain :");
    expect(html).not.toContain("Transforme 25 idées en budget et réputation.");
    expect(html).not.toContain(">Utiliser<");
  });
});
