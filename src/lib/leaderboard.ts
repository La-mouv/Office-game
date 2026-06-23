export const OFFICE_VILLAGE_GAME_ID = "office-village";
export const LEADERBOARD_EXPANDED_LIMIT = 50;

export type LeaderboardEntry = {
  rank: number;
  playerName: string;
  elapsedMs: number;
  createdAt: string;
};

export type LeaderboardResponse = {
  entries: LeaderboardEntry[];
  playerEntry?: LeaderboardEntry | null;
};

export type LeaderboardSubmission = {
  gameId: string;
  playerName: string;
  playerToken: string;
  elapsedMs: number;
  runId: string;
};

export type LeaderboardSubmissionResult = LeaderboardResponse & {
  saved: boolean;
};

export type LeaderboardPlayerRegistration = {
  gameId: string;
  playerName: string;
  normalizedPlayerName: string;
  playerToken?: string;
};

export type LeaderboardPlayerRegistrationResult = {
  playerName: string;
  playerToken: string;
};

function normalizeToken(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizePlayerNameKey(playerName: string): string {
  return playerName
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildLeaderboardRunId(playerName: string, startedAt: number, completedAt: number): string {
  return `${OFFICE_VILLAGE_GAME_ID}:${normalizePlayerNameKey(playerName)}:${startedAt}:${completedAt}`;
}

export function buildLeaderboardUrl(runId?: string | null, limit = 3): string {
  const params = new URLSearchParams({
    gameId: OFFICE_VILLAGE_GAME_ID,
    limit: String(limit),
  });

  if (runId) {
    params.set("runId", runId);
  }

  return `/api/leaderboard?${params.toString()}`;
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
  const playerToken = normalizeToken(payload.playerToken);
  const runId = typeof payload.runId === "string" ? payload.runId.trim() : "";
  const elapsedMs = typeof payload.elapsedMs === "number" ? Math.floor(payload.elapsedMs) : 0;

  if (gameId !== OFFICE_VILLAGE_GAME_ID) return null;
  if (playerName.length < 1 || playerName.length > 20 || !normalizePlayerNameKey(playerName)) return null;
  if (playerToken.length < 16 || playerToken.length > 140) return null;
  if (runId.length < 8 || runId.length > 140) return null;
  if (!Number.isSafeInteger(elapsedMs) || elapsedMs <= 0) return null;

  return {
    gameId,
    playerName,
    playerToken,
    elapsedMs,
    runId,
  };
}

export function normalizeLeaderboardPlayerRegistration(
  value: unknown,
): LeaderboardPlayerRegistration | null {
  if (!value || typeof value !== "object") return null;
  const payload = value as Partial<Record<keyof LeaderboardPlayerRegistration, unknown>>;
  const gameId = typeof payload.gameId === "string" ? payload.gameId.trim() : "";
  const playerName = typeof payload.playerName === "string" ? payload.playerName.trim() : "";
  const playerToken = normalizeToken(payload.playerToken);
  const normalizedPlayerName = normalizePlayerNameKey(playerName);

  if (gameId !== OFFICE_VILLAGE_GAME_ID) return null;
  if (playerName.length < 1 || playerName.length > 20 || !normalizedPlayerName) return null;
  if (playerToken && (playerToken.length < 16 || playerToken.length > 140)) return null;

  return {
    gameId,
    playerName,
    normalizedPlayerName,
    ...(playerToken ? { playerToken } : {}),
  };
}
