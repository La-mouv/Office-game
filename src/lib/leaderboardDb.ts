import { neon } from "@neondatabase/serverless";
import type { LeaderboardEntry, LeaderboardSubmission } from "@/lib/leaderboard";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

type LeaderboardRow = {
  player_name: string;
  elapsed_ms: string | number;
  created_at: string;
};

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  return databaseUrl;
}

function getClient() {
  return neon(getDatabaseUrl());
}

function toLeaderboardEntries(rows: LeaderboardRow[]): LeaderboardEntry[] {
  return rows.map((row, index) => ({
    rank: index + 1,
    playerName: row.player_name,
    elapsedMs: Number(row.elapsed_ms),
    createdAt: row.created_at,
  }));
}

export function normalizeLeaderboardLimit(limit: number) {
  if (!Number.isFinite(limit)) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.max(1, Math.floor(limit)));
}

export async function getLeaderboard(gameId: string, limit = DEFAULT_LIMIT): Promise<LeaderboardEntry[]> {
  const sql = getClient();
  const safeLimit = normalizeLeaderboardLimit(limit);
  const rows = await sql`
    SELECT player_name, elapsed_ms, created_at
    FROM leaderboard_scores
    WHERE game_id = ${gameId}
    ORDER BY elapsed_ms ASC, created_at ASC
    LIMIT ${safeLimit}
  `;

  return toLeaderboardEntries(rows as LeaderboardRow[]);
}

export async function submitLeaderboardScore(
  submission: LeaderboardSubmission,
): Promise<{ saved: boolean; entries: LeaderboardEntry[] }> {
  const sql = getClient();
  const rows = await sql`
    INSERT INTO leaderboard_scores (game_id, player_name, elapsed_ms, run_id)
    VALUES (${submission.gameId}, ${submission.playerName}, ${submission.elapsedMs}, ${submission.runId})
    ON CONFLICT (game_id, run_id) DO NOTHING
    RETURNING id
  `;

  return {
    saved: rows.length > 0,
    entries: await getLeaderboard(submission.gameId),
  };
}

