import { NextRequest, NextResponse } from "next/server";
import {
  normalizeLeaderboardPlayerRegistration,
  type LeaderboardPlayerRegistrationResult,
} from "@/lib/leaderboard";
import {
  LeaderboardPlayerNameTakenError,
  registerLeaderboardPlayer,
} from "@/lib/leaderboardDb";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const registration = normalizeLeaderboardPlayerRegistration(body);
  if (!registration) {
    return NextResponse.json({ error: "Invalid player name" }, { status: 400 });
  }

  try {
    const response: LeaderboardPlayerRegistrationResult =
      await registerLeaderboardPlayer(registration);
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof LeaderboardPlayerNameTakenError) {
      return NextResponse.json({ error: "Player name already taken" }, { status: 409 });
    }

    return NextResponse.json({ error: "Leaderboard unavailable" }, { status: 503 });
  }
}
