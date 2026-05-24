import { NextRequest, NextResponse } from "next/server";
import {
  OFFICE_VILLAGE_GAME_ID,
  normalizeLeaderboardSubmission,
  type LeaderboardResponse,
  type LeaderboardSubmissionResult,
} from "@/lib/leaderboard";
import { getLeaderboard, normalizeLeaderboardLimit, submitLeaderboardScore } from "@/lib/leaderboardDb";

export const runtime = "nodejs";

function databaseErrorResponse() {
  return NextResponse.json(
    { error: "Leaderboard unavailable" },
    { status: 503 },
  );
}

export async function GET(request: NextRequest) {
  const gameId = request.nextUrl.searchParams.get("gameId") ?? OFFICE_VILLAGE_GAME_ID;
  const limit = normalizeLeaderboardLimit(Number(request.nextUrl.searchParams.get("limit") ?? "10"));

  if (gameId !== OFFICE_VILLAGE_GAME_ID) {
    return NextResponse.json({ error: "Unknown game" }, { status: 400 });
  }

  try {
    const response: LeaderboardResponse = {
      entries: await getLeaderboard(gameId, limit),
    };
    return NextResponse.json(response);
  } catch {
    return databaseErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const submission = normalizeLeaderboardSubmission(body);
  if (!submission) {
    return NextResponse.json({ error: "Invalid leaderboard score" }, { status: 400 });
  }

  try {
    const result = await submitLeaderboardScore(submission);
    const response: LeaderboardSubmissionResult = result;
    return NextResponse.json(response);
  } catch {
    return databaseErrorResponse();
  }
}

