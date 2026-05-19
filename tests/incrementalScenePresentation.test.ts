import { describe, expect, it } from "vitest";
import {
  getRecentLogEntries,
  getSceneReaction,
} from "@/lib/incrementalPresentation";
import type { Resources } from "@/types/incremental";

describe("incremental scene presentation", () => {
  it("prefers a chaos reaction when chaos rises", () => {
    const before: Resources = { ideas: 0, budget: 0, ambiance: 50, reputation: 0, chaos: 5 };
    const after: Resources = { ideas: 0, budget: 0, ambiance: 55, reputation: 0, chaos: 8 };

    expect(getSceneReaction(before, after)).toBe("chaos");
  });

  it("returns an ambiance reaction when ambiance rises alone", () => {
    const before: Resources = { ideas: 0, budget: 0, ambiance: 50, reputation: 0, chaos: 5 };
    const after: Resources = { ideas: 0, budget: 0, ambiance: 55, reputation: 0, chaos: 5 };

    expect(getSceneReaction(before, after)).toBe("ambiance");
  });

  it("keeps only the latest journal entries for the compact feed", () => {
    expect(getRecentLogEntries(["a", "b", "c", "d", "e"], 3)).toEqual(["c", "d", "e"]);
  });
});
