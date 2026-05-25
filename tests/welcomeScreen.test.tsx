import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { WelcomeScreen } from "@/components/incremental/WelcomeScreen";
import { getCopy } from "@/lib/gameTranslations";

describe("WelcomeScreen", () => {
  it("renders nickname, leaderboard, start, language flags, and the presentation image", () => {
    const html = renderToStaticMarkup(
      <WelcomeScreen
        copy={getCopy("en").welcome}
        language="en"
        playerName=""
        showNameError={false}
        onPlayerNameChange={vi.fn()}
        onLanguageChange={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    expect(html).toContain("Nickname");
    expect(html).toContain("Leaderboard");
    expect(html).toContain("Start game");
    expect(html).toContain("🇫🇷");
    expect(html).toContain("🇬🇧");
    expect(html).toContain("🇪🇸");
    expect(html).toContain("office-village-cover.png");
  });

  it("renders real leaderboard entries when Neon returns scores", () => {
    const html = renderToStaticMarkup(
      <WelcomeScreen
        copy={getCopy("en").welcome}
        language="en"
        playerName=""
        leaderboardEntries={[
          {
            rank: 1,
            playerName: "Alexis",
            elapsedMs: 65_000,
            createdAt: "2026-05-24T20:00:00.000Z",
          },
        ]}
        showNameError={false}
        onPlayerNameChange={vi.fn()}
        onLanguageChange={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    expect(html).toContain("#1");
    expect(html).toContain("Alexis");
    expect(html).toContain("01:05");
  });

  it("keeps the welcome leaderboard compact when no score is available", () => {
    const html = renderToStaticMarkup(
      <WelcomeScreen
        copy={getCopy("fr").welcome}
        language="fr"
        playerName=""
        showNameError={false}
        onPlayerNameChange={vi.fn()}
        onLanguageChange={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    expect(html).not.toContain("Aucun score pour l&#x27;instant");
    expect(html).not.toContain("Pseudo et temps final");
  });
});
