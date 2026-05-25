import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { EndScreen } from "@/components/incremental/EndScreen";
import { getCopy } from "@/lib/gameTranslations";

describe("EndScreen", () => {
  it("shows the final score, player rank, leaderboard, and restart action", () => {
    const copy = getCopy("fr");
    const html = renderToStaticMarkup(
      <EndScreen
        copy={copy}
        language="fr"
        playerName="Alexis"
        elapsedMs={65_000}
        playerEntry={{
          rank: 2,
          playerName: "Alexis",
          elapsedMs: 65_000,
          createdAt: "2026-05-25T09:00:00.000Z",
        }}
        leaderboardEntries={[
          {
            rank: 1,
            playerName: "Nina",
            elapsedMs: 62_000,
            createdAt: "2026-05-25T08:00:00.000Z",
          },
          {
            rank: 2,
            playerName: "Alexis",
            elapsedMs: 65_000,
            createdAt: "2026-05-25T09:00:00.000Z",
          },
        ]}
        leaderboardLoading={false}
        onRestart={vi.fn()}
      />,
    );

    expect(html).toContain("Partie terminée");
    expect(html).toContain("Alexis");
    expect(html).toContain("01:05");
    expect(html).toContain("#2");
    expect(html).toContain("Leaderboard");
    expect(html).toContain("Recommencer");
  });
});
