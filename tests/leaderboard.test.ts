import { describe, expect, it } from "vitest";
import {
  OFFICE_VILLAGE_GAME_ID,
  buildLeaderboardRunId,
  buildLeaderboardUrl,
  formatLeaderboardTime,
  normalizeLeaderboardPlayerRegistration,
  normalizeLeaderboardSubmission,
  normalizePlayerNameKey,
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

  it("normalizes player names so duplicates are case and accent insensitive", () => {
    expect(normalizePlayerNameKey("  Élodie  Office ")).toBe("elodie-office");
    expect(normalizePlayerNameKey("Elodie-office")).toBe("elodie-office");
  });

  it("accepts a small player registration payload", () => {
    expect(
      normalizeLeaderboardPlayerRegistration({
        gameId: OFFICE_VILLAGE_GAME_ID,
        playerName: " Alexis ",
        playerToken: "player-token-123456",
      }),
    ).toEqual({
      gameId: OFFICE_VILLAGE_GAME_ID,
      playerName: "Alexis",
      normalizedPlayerName: "alexis",
      playerToken: "player-token-123456",
    });
  });

  it("builds a leaderboard URL that can ask for the current player's rank", () => {
    expect(buildLeaderboardUrl("office-village:alexis:100:900", 5)).toBe(
      "/api/leaderboard?gameId=office-village&limit=5&runId=office-village%3Aalexis%3A100%3A900",
    );
  });

  it("accepts only the small score payload we want to store", () => {
    expect(
      normalizeLeaderboardSubmission({
        gameId: OFFICE_VILLAGE_GAME_ID,
        playerName: " Alexis ",
        playerToken: "player-token-123456",
        elapsedMs: 123_456.9,
        runId: "run-123456",
        ignored: "no stats",
      }),
    ).toEqual({
      gameId: OFFICE_VILLAGE_GAME_ID,
      playerName: "Alexis",
      playerToken: "player-token-123456",
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
        playerToken: "player-token-123456",
        elapsedMs: 123_456,
        runId: "run-123456",
      }),
    ).toBeNull();
  });

  it("rejects leaderboard scores without the reserved player token", () => {
    expect(
      normalizeLeaderboardSubmission({
        gameId: OFFICE_VILLAGE_GAME_ID,
        playerName: "Alexis",
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
