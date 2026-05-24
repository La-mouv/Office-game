import { describe, expect, it } from "vitest";
import {
  OFFICE_VILLAGE_GAME_ID,
  buildLeaderboardRunId,
  formatLeaderboardTime,
  normalizeLeaderboardSubmission,
} from "@/lib/leaderboard";
import { normalizeLeaderboardLimit } from "@/lib/leaderboardDb";

describe("leaderboard helpers", () => {
  it("formats fastest times for the welcome leaderboard", () => {
    expect(formatLeaderboardTime(65_000)).toBe("01:05");
    expect(formatLeaderboardTime(10 * 60_000 + 9_000)).toBe("10:09");
  });

  it("builds a stable run id for duplicate protection", () => {
    expect(buildLeaderboardRunId(" Alexis ", 100, 900)).toBe("office-village:alexis:100:900");
  });

  it("accepts only the small score payload we want to store", () => {
    expect(
      normalizeLeaderboardSubmission({
        gameId: OFFICE_VILLAGE_GAME_ID,
        playerName: " Alexis ",
        elapsedMs: 123_456.9,
        runId: "run-123456",
        ignored: "no stats",
      }),
    ).toEqual({
      gameId: OFFICE_VILLAGE_GAME_ID,
      playerName: "Alexis",
      elapsedMs: 123_456,
      runId: "run-123456",
    });
  });

  it("rejects unknown games and empty names", () => {
    expect(
      normalizeLeaderboardSubmission({
        gameId: "other-game",
        playerName: "Alexis",
        elapsedMs: 123_456,
        runId: "run-123456",
      }),
    ).toBeNull();
    expect(
      normalizeLeaderboardSubmission({
        gameId: OFFICE_VILLAGE_GAME_ID,
        playerName: "",
        elapsedMs: 123_456,
        runId: "run-123456",
      }),
    ).toBeNull();
  });

  it("keeps leaderboard limits bounded", () => {
    expect(normalizeLeaderboardLimit(Number.NaN)).toBe(10);
    expect(normalizeLeaderboardLimit(0)).toBe(1);
    expect(normalizeLeaderboardLimit(999)).toBe(50);
  });
});
