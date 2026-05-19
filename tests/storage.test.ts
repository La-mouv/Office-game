import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/lib/gameLogic";
import { parseSavedGame } from "../src/lib/storage";

describe("save parsing", () => {
  it("accepts a valid serialized game", () => {
    const state = createInitialGameState(() => 0);

    expect(parseSavedGame(JSON.stringify(state))?.day).toBe(1);
  });

  it("rejects invalid or malformed saves", () => {
    expect(parseSavedGame("{oops")).toBeNull();
    expect(parseSavedGame(JSON.stringify({ hello: true }))).toBeNull();
  });
});
