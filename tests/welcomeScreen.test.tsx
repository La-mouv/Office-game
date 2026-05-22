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
});
