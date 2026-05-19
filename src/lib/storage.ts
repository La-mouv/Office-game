import type { GameState } from "@/types/game";

export const SAVE_KEY = "office-village-save-v1";

export function parseSavedGame(raw: string): GameState | null {
  try {
    const parsed = JSON.parse(raw) as Partial<GameState>;
    const isValid =
      typeof parsed.day === "number" &&
      typeof parsed.turn === "number" &&
      typeof parsed.resources === "object" &&
      Array.isArray(parsed.deck) &&
      Array.isArray(parsed.hand) &&
      Array.isArray(parsed.placedCards) &&
      Array.isArray(parsed.inventory) &&
      Array.isArray(parsed.unlockedSkills) &&
      Array.isArray(parsed.activeProjects) &&
      Array.isArray(parsed.completedProjects) &&
      Array.isArray(parsed.log) &&
      typeof parsed.gameStatus === "string";

    return isValid ? (parsed as GameState) : null;
  } catch {
    return null;
  }
}

export function saveGame(state: GameState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function loadGame(): GameState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return parseSavedGame(raw);
  } catch {
    return null;
  }
}
