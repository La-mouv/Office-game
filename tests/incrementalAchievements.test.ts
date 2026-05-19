import { describe, expect, it } from "vitest";
import {
  getAchievementBadges,
  getUnlockedAchievementBadges,
} from "@/lib/incrementalAchievements";
import { createInitialGameState } from "@/lib/incrementalGame";

describe("incremental achievements", () => {
  it("merges synergies and milestones into one achievement collection", () => {
    const badges = getAchievementBadges(createInitialGameState(0));

    expect(badges.some((badge) => badge.kind === "combo")).toBe(true);
    expect(badges.some((badge) => badge.kind === "palier")).toBe(true);
  });

  it("returns unlocked combo and palier badges for the office wall", () => {
    const state = createInitialGameState(0);
    state.synergies[0].discovered = true;
    state.milestones[0].achieved = true;

    const badges = getUnlockedAchievementBadges(state);

    expect(badges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: state.synergies[0].id, kind: "combo", unlocked: true }),
        expect.objectContaining({ id: state.milestones[0].id, kind: "palier", unlocked: true }),
      ]),
    );
  });
});
