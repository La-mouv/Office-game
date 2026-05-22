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

  it("shows a language choice inside the menu", () => {
    const html = renderToStaticMarkup(
      <OfficeTopControls
        state={createInitialGameState(0)}
        onNewGame={vi.fn()}
        onSave={vi.fn()}
        onLoad={vi.fn()}
        initialMenuOpen
      />,
    );

    expect(html).toContain("Langue");
    expect(html).toContain("Français");
    expect(html).toContain("English");
    expect(html).toContain("Español");
    expect(html).toContain("aria-pressed=\"true\"");
  });
});
