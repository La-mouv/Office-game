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

  it("can expand the end leaderboard from the top 5 to the full loaded list", () => {
    const copy = getCopy("fr");
    const leaderboardEntries = [
      { rank: 1, playerName: "Nina", elapsedMs: 62_000, createdAt: "2026-05-25T08:00:00.000Z" },
      { rank: 2, playerName: "Alexis", elapsedMs: 65_000, createdAt: "2026-05-25T09:00:00.000Z" },
      { rank: 3, playerName: "Sam", elapsedMs: 70_000, createdAt: "2026-05-25T10:00:00.000Z" },
      { rank: 4, playerName: "Lina", elapsedMs: 75_000, createdAt: "2026-05-25T11:00:00.000Z" },
      { rank: 5, playerName: "Maya", elapsedMs: 80_000, createdAt: "2026-05-25T12:00:00.000Z" },
      { rank: 6, playerName: "Morgan", elapsedMs: 85_000, createdAt: "2026-05-25T13:00:00.000Z" },
    ];
    const baseProps = {
      copy,
      language: "fr" as const,
      playerName: "Alexis",
      elapsedMs: 65_000,
      playerEntry: leaderboardEntries[1],
      leaderboardEntries,
      leaderboardLoading: false,
      onRestart: vi.fn(),
    };

    const compactHtml = renderToStaticMarkup(<EndScreen {...baseProps} />);
    const expandedHtml = renderToStaticMarkup(
      <EndScreen {...baseProps} initialLeaderboardExpanded />,
    );

    expect(compactHtml).toContain("Voir tout le leaderboard");
    expect(compactHtml).not.toContain("Morgan");
    expect(expandedHtml).toContain("Morgan");
    expect(expandedHtml).toContain("Voir le top 5");
  });
});
