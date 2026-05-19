import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { IncrementalSidebar } from "@/components/incremental/IncrementalSidebar";
import { createInitialGameState } from "@/lib/incrementalGame";

describe("IncrementalSidebar", () => {
  it("keeps secondary controls behind a bottom-left Menu button by default", () => {
    const html = renderToStaticMarkup(
      <IncrementalSidebar
        activeView="office"
        state={createInitialGameState(0)}
        onViewChange={vi.fn()}
        onNewGame={vi.fn()}
        onSave={vi.fn()}
        onLoad={vi.fn()}
      />,
    );

    expect(html).toContain("Menu");
    expect(html).not.toContain("Vue d’ensemble");
    expect(html).not.toContain("Règle d’or");
    expect(html).not.toContain("Sauvegarder");
  });
});
