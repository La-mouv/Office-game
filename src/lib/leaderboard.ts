export const OFFICE_VILLAGE_GAME_ID = "office-village";

export type LeaderboardEntry = {
  rank: number;
  playerName: string;
  elapsedMs: number;
  createdAt: string;
};

export type LeaderboardResponse = {
  entries: LeaderboardEntry[];
};

export type LeaderboardSubmission = {
  gameId: string;
  playerName: string;
  elapsedMs: number;
  runId: string;
};

export type LeaderboardSubmissionResult = LeaderboardResponse & {
  saved: boolean;
};

export function buildLeaderboardRunId(playerName: string, startedAt: number, completedAt: number): string {
  const normalizedName = playerName.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
  return `${OFFICE_VILLAGE_GAME_ID}:${normalizedName}:${startedAt}:${completedAt}`;
}

export function formatLeaderboardTime(elapsedMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function normalizeLeaderboardSubmission(value: unknown): LeaderboardSubmission | null {
  if (!value || typeof value !== "object") return null;
  const payload = value as Partial<Record<keyof LeaderboardSubmission, unknown>>;
  const gameId = typeof payload.gameId === "string" ? payload.gameId.trim() : "";
  const playerName = typeof payload.playerName === "string" ? payload.playerName.trim() : "";
  const runId = typeof payload.runId === "string" ? payload.runId.trim() : "";
  const elapsedMs = typeof payload.elapsedMs === "number" ? Math.floor(payload.elapsedMs) : 0;

  if (gameId !== OFFICE_VILLAGE_GAME_ID) return null;
  if (playerName.length < 1 || playerName.length > 20) return null;
  if (runId.length < 8 || runId.length > 140) return null;
  if (!Number.isSafeInteger(elapsedMs) || elapsedMs <= 0) return null;

  return {
    gameId,
    playerName,
    elapsedMs,
    runId,
  };
}
