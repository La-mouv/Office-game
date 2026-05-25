import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import {
  normalizePlayerNameKey,
  type LeaderboardEntry,
  type LeaderboardPlayerRegistration,
  type LeaderboardPlayerRegistrationResult,
  type LeaderboardSubmission,
} from "@/lib/leaderboard";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

type LeaderboardRow = {
  player_name: string;
  elapsed_ms: string | number;
  created_at: string;
};

type RankedLeaderboardRow = LeaderboardRow & {
  rank: string | number;
};

type LeaderboardPlayerRow = {
  id: string | number;
  player_name: string;
  player_token: string;
};

let schemaReady: Promise<void> | null = null;

export class LeaderboardPlayerNameTakenError extends Error {
  constructor() {
    super("Player name is already taken");
  }
}

export class LeaderboardPlayerTokenError extends Error {
  constructor() {
    super("Player token does not match this name");
  }
}

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

async function ensureLeaderboardSchema() {
  if (!schemaReady) {
    const sql = getClient();
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS leaderboard_players (
          id bigserial PRIMARY KEY,
          game_id text NOT NULL,
          player_name text NOT NULL CHECK (char_length(player_name) BETWEEN 1 AND 20),
          normalized_player_name text NOT NULL,
          player_token text NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS leaderboard_scores (
          id bigserial PRIMARY KEY,
          game_id text NOT NULL,
          player_name text NOT NULL CHECK (char_length(player_name) BETWEEN 1 AND 20),
          elapsed_ms bigint NOT NULL CHECK (elapsed_ms > 0),
          run_id text,
          created_at timestamptz NOT NULL DEFAULT now(),
          UNIQUE (game_id, run_id)
        )
      `;
      await sql`
        ALTER TABLE leaderboard_scores
        ADD COLUMN IF NOT EXISTS player_id bigint REFERENCES leaderboard_players(id)
      `;
      await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS leaderboard_players_game_name_idx
        ON leaderboard_players (game_id, normalized_player_name)
      `;
      await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS leaderboard_players_game_token_idx
        ON leaderboard_players (game_id, player_token)
      `;
      await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS leaderboard_scores_game_player_idx
        ON leaderboard_scores (game_id, player_id)
        WHERE player_id IS NOT NULL
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS leaderboard_scores_game_time_idx
        ON leaderboard_scores (game_id, elapsed_ms ASC, created_at ASC, id ASC)
      `;
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }

  return schemaReady;
}

function toLeaderboardEntries(rows: LeaderboardRow[]): LeaderboardEntry[] {
  return rows.map((row, index) => ({
    rank: index + 1,
    playerName: row.player_name,
    elapsedMs: Number(row.elapsed_ms),
    createdAt: row.created_at,
  }));
}

function toLeaderboardEntry(row: RankedLeaderboardRow): LeaderboardEntry {
  return {
    rank: Number(row.rank),
    playerName: row.player_name,
    elapsedMs: Number(row.elapsed_ms),
    createdAt: row.created_at,
  };
}

export function normalizeLeaderboardLimit(limit: number) {
  if (!Number.isFinite(limit)) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.max(1, Math.floor(limit)));
}

export async function getLeaderboard(gameId: string, limit = DEFAULT_LIMIT): Promise<LeaderboardEntry[]> {
  await ensureLeaderboardSchema();
  const sql = getClient();
  const safeLimit = normalizeLeaderboardLimit(limit);
  const rows = await sql`
    WITH candidate_scores AS (
      SELECT
        scores.id,
        COALESCE(players.normalized_player_name, lower(scores.player_name)) AS player_key,
        COALESCE(players.player_name, scores.player_name) AS player_name,
        scores.elapsed_ms,
        scores.created_at
      FROM leaderboard_scores AS scores
      LEFT JOIN leaderboard_players AS players ON players.id = scores.player_id
      WHERE scores.game_id = ${gameId}
    ),
    best_scores AS (
      SELECT DISTINCT ON (player_key)
        id,
        player_name,
        elapsed_ms,
        created_at
      FROM candidate_scores
      ORDER BY player_key, elapsed_ms ASC, created_at ASC, id ASC
    )
    SELECT player_name, elapsed_ms, created_at
    FROM best_scores
    ORDER BY elapsed_ms ASC, created_at ASC, id ASC
    LIMIT ${safeLimit}
  `;

  return toLeaderboardEntries(rows as LeaderboardRow[]);
}

async function getLeaderboardPlayer(
  gameId: string,
  normalizedPlayerName: string,
): Promise<LeaderboardPlayerRow | null> {
  await ensureLeaderboardSchema();
  const sql = getClient();
  const rows = await sql`
    SELECT id, player_name, player_token
    FROM leaderboard_players
    WHERE game_id = ${gameId}
      AND normalized_player_name = ${normalizedPlayerName}
    LIMIT 1
  `;
  const [row] = rows as LeaderboardPlayerRow[];
  return row ?? null;
}

export async function registerLeaderboardPlayer(
  registration: LeaderboardPlayerRegistration,
): Promise<LeaderboardPlayerRegistrationResult> {
  await ensureLeaderboardSchema();
  const sql = getClient();
  const existingPlayer = await getLeaderboardPlayer(
    registration.gameId,
    registration.normalizedPlayerName,
  );

  if (existingPlayer) {
    if (registration.playerToken && existingPlayer.player_token === registration.playerToken) {
      return {
        playerName: existingPlayer.player_name,
        playerToken: existingPlayer.player_token,
      };
    }

    throw new LeaderboardPlayerNameTakenError();
  }

  const playerToken = registration.playerToken ?? randomUUID();
  const rows = await sql`
    INSERT INTO leaderboard_players (game_id, player_name, normalized_player_name, player_token)
    VALUES (
      ${registration.gameId},
      ${registration.playerName},
      ${registration.normalizedPlayerName},
      ${playerToken}
    )
    RETURNING player_name, player_token
  `;
  const [createdPlayer] = rows as Pick<LeaderboardPlayerRow, "player_name" | "player_token">[];

  return {
    playerName: createdPlayer.player_name,
    playerToken: createdPlayer.player_token,
  };
}

export async function getLeaderboardEntryForRun(
  gameId: string,
  runId: string,
): Promise<LeaderboardEntry | null> {
  await ensureLeaderboardSchema();
  const sql = getClient();
  const rows = await sql`
    WITH candidate_scores AS (
      SELECT
        scores.id,
        scores.run_id,
        scores.player_id,
        COALESCE(players.normalized_player_name, lower(scores.player_name)) AS player_key,
        COALESCE(players.player_name, scores.player_name) AS player_name,
        scores.elapsed_ms,
        scores.created_at
      FROM leaderboard_scores AS scores
      LEFT JOIN leaderboard_players AS players ON players.id = scores.player_id
      WHERE scores.game_id = ${gameId}
    ),
    best_scores AS (
      SELECT DISTINCT ON (player_key)
        id,
        run_id,
        player_id,
        player_name,
        elapsed_ms,
        created_at
      FROM candidate_scores
      ORDER BY player_key, elapsed_ms ASC, created_at ASC, id ASC
    ),
    ranked_scores AS (
      SELECT
        run_id,
        player_id,
        player_name,
        elapsed_ms,
        created_at,
        row_number() OVER (ORDER BY elapsed_ms ASC, created_at ASC, id ASC) AS rank
      FROM best_scores
    )
    SELECT player_name, elapsed_ms, created_at, rank
    FROM ranked_scores
    WHERE run_id = ${runId}
    LIMIT 1
  `;

  const [row] = rows as RankedLeaderboardRow[];
  return row ? toLeaderboardEntry(row) : null;
}

async function getLeaderboardEntryForPlayer(
  gameId: string,
  playerId: string | number,
): Promise<LeaderboardEntry | null> {
  await ensureLeaderboardSchema();
  const sql = getClient();
  const rows = await sql`
    WITH candidate_scores AS (
      SELECT
        scores.id,
        scores.run_id,
        scores.player_id,
        COALESCE(players.normalized_player_name, lower(scores.player_name)) AS player_key,
        COALESCE(players.player_name, scores.player_name) AS player_name,
        scores.elapsed_ms,
        scores.created_at
      FROM leaderboard_scores AS scores
      LEFT JOIN leaderboard_players AS players ON players.id = scores.player_id
      WHERE scores.game_id = ${gameId}
    ),
    best_scores AS (
      SELECT DISTINCT ON (player_key)
        id,
        run_id,
        player_id,
        player_name,
        elapsed_ms,
        created_at
      FROM candidate_scores
      ORDER BY player_key, elapsed_ms ASC, created_at ASC, id ASC
    ),
    ranked_scores AS (
      SELECT
        run_id,
        player_id,
        player_name,
        elapsed_ms,
        created_at,
        row_number() OVER (ORDER BY elapsed_ms ASC, created_at ASC, id ASC) AS rank
      FROM best_scores
    )
    SELECT player_name, elapsed_ms, created_at, rank
    FROM ranked_scores
    WHERE player_id = ${playerId}
    LIMIT 1
  `;

  const [row] = rows as RankedLeaderboardRow[];
  return row ? toLeaderboardEntry(row) : null;
}

export async function getLeaderboardResult(
  gameId: string,
  limit = DEFAULT_LIMIT,
  runId?: string | null,
): Promise<{ entries: LeaderboardEntry[]; playerEntry: LeaderboardEntry | null }> {
  const [entries, playerEntry] = await Promise.all([
    getLeaderboard(gameId, limit),
    runId ? getLeaderboardEntryForRun(gameId, runId) : Promise.resolve(null),
  ]);

  return { entries, playerEntry };
}

export async function submitLeaderboardScore(
  submission: LeaderboardSubmission,
): Promise<{ saved: boolean; entries: LeaderboardEntry[]; playerEntry: LeaderboardEntry | null }> {
  await ensureLeaderboardSchema();
  const sql = getClient();
  const normalizedPlayerName = normalizePlayerNameKey(submission.playerName);
  const player = await getLeaderboardPlayer(submission.gameId, normalizedPlayerName);

  if (!player || player.player_token !== submission.playerToken) {
    throw new LeaderboardPlayerTokenError();
  }

  const rows = await sql`
    INSERT INTO leaderboard_scores (game_id, player_name, player_id, elapsed_ms, run_id)
    VALUES (
      ${submission.gameId},
      ${player.player_name},
      ${player.id},
      ${submission.elapsedMs},
      ${submission.runId}
    )
    ON CONFLICT (game_id, player_id) WHERE player_id IS NOT NULL
    DO UPDATE SET
      player_name = EXCLUDED.player_name,
      elapsed_ms = EXCLUDED.elapsed_ms,
      run_id = EXCLUDED.run_id,
      created_at = now()
    WHERE EXCLUDED.elapsed_ms < leaderboard_scores.elapsed_ms
    RETURNING id
  `;
  const entries = await getLeaderboard(submission.gameId);
  const playerEntry = await getLeaderboardEntryForPlayer(submission.gameId, player.id);

  return {
    saved: rows.length > 0,
    entries,
    playerEntry,
  };
}
