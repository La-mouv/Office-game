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

  it("shows flag language buttons inside the menu", () => {
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
    expect(html).toContain("Sauvegarde automatique active");
    expect(html).not.toContain("Sauvegarder");
    expect(html).not.toContain("Charger");
    expect(html).toContain("🇫🇷");
    expect(html).toContain("🇬🇧");
    expect(html).toContain("🇪🇸");
    expect(html).toContain('aria-label="Français"');
    expect(html).toContain('aria-label="English"');
    expect(html).toContain('aria-label="Español"');
    expect(html).toContain("aria-pressed=\"true\"");
  });

  it("can show a clear confirmation before starting a new game", () => {
    const html = renderToStaticMarkup(
      <OfficeTopControls
        state={createInitialGameState(0)}
        onNewGame={vi.fn()}
        onSave={vi.fn()}
        onLoad={vi.fn()}
        initialMenuOpen
        initialNewGameConfirmOpen
      />,
    );

    expect(html).toContain("Nouvelle partie ?");
    expect(html).toContain("Ça remet la progression à zéro.");
    expect(html).toContain("Annuler");
    expect(html).toContain("Recommencer");
  });
});
