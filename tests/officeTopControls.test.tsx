import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { OfficeTopControls } from "@/components/incremental/OfficeTopControls";
import { createInitialGameState } from "@/lib/incrementalGame";

describe("OfficeTopControls", () => {
  it("renders réussite and menu controls without the old sidebar buttons", () => {
    const html = renderToStaticMarkup(
      <OfficeTopControls
        state={createInitialGameState(0)}
        onNewGame={vi.fn()}
        onSave={vi.fn()}
        onLoad={vi.fn()}
      />,
    );

    expect(html).toContain("Réussites");
    expect(html).toContain("Menu");
    expect(html).not.toContain(">Bureau<");
  });
});
