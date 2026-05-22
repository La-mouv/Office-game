import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/lib/incrementalGame";
import { SAVE_KEY, parseSavedGame, rehydrateSavedGame } from "../src/lib/incrementalStorage";

describe("incremental save parsing", () => {
  it("uses the new incremental save key and accepts a valid serialized game", () => {
    const state = createInitialGameState(1_000);

    expect(SAVE_KEY).toBe("office-village-incremental-save-v1");
    expect(parseSavedGame(JSON.stringify(state))?.resources.budget).toBe(50);
  });

  it("rejects invalid or malformed saves safely", () => {
    expect(parseSavedGame("{oops")).toBeNull();
    expect(parseSavedGame(JSON.stringify({ hello: true }))).toBeNull();
  });

  it("rehydrates an older save onto the latest balance data", () => {
    const state = createInitialGameState(1_000);
    const olderSave = {
      ...state,
      locations: state.locations.map((location) =>
        location.id === "starting-office"
          ? { ...location, level: 5, maxLevel: 5 }
          : location.id === "coffee-machine"
            ? { ...location, baseCost: 50, unlockReputation: 50 }
            : location,
      ),
      manualActions: state.manualActions.map((action) =>
        action.id === "client-pitch"
          ? {
              ...action,
              effect: { reputation: 10 },
            }
          : action,
      ),
    };

    const rehydrated = rehydrateSavedGame(olderSave);

    expect(rehydrated.locations.find((location) => location.id === "starting-office")).toMatchObject({
      level: 1,
      maxLevel: 1,
    });
    expect(rehydrated.locations.find((location) => location.id === "coffee-machine")).toMatchObject({
      baseCost: 40,
      unlockReputation: 20,
    });
    expect(rehydrated.manualActions.find((action) => action.id === "client-pitch")).toMatchObject({
      cost: { ideas: 25 },
      effect: { budget: 30, reputation: 15 },
    });
    expect(rehydrated.activeMission?.id).toBe("guided-first-intern");
    expect(rehydrated.completedMissionIds).toEqual([]);
    expect(rehydrated.activeBoosts).toEqual([]);
  });

  it("removes retired manual actions and their old journal traces from saved games", () => {
    const state = createInitialGameState(1_000);
    const olderSave = {
      ...state,
      manualActions: [
        ...state.manualActions,
        {
          id: "team-sprint",
          name: "Sprint équipe",
          description: "+80 idées, +5 chaos.",
          cooldownMs: 45_000,
          lastUsedAt: 5_000,
          effect: { ideas: 80, chaos: 5 },
          emoji: "🚀",
        },
      ],
      manualActionUseCounts: {
        brainstorm: 1,
        "team-sprint": 2,
      },
      log: ["Bienvenue.", "Action : Sprint équipe.", "Action : Brainstorm."],
    };

    const rehydrated = rehydrateSavedGame(olderSave);

    expect(rehydrated.manualActions.map((action) => action.id)).not.toContain("team-sprint");
    expect(rehydrated.manualActionUseCounts).toEqual({ brainstorm: 1 });
    expect(rehydrated.log.join(" ")).not.toContain("Sprint équipe");
  });

  it("preserves mission and boost state for newer saves", () => {
    const state = {
      ...createInitialGameState(1_000),
      completedMissionIds: ["guided-first-intern"],
      activeMission: {
        id: "guided-first-ideas",
        templateId: "guided-first-ideas",
        kind: "guided" as const,
        title: "Un peu de matière grise",
        description: "Atteins 25 idées.",
        emoji: "💡",
        requirement: { kind: "resourceAtLeast" as const, resource: "ideas" as const, amount: 25 },
        reward: { resources: { budget: 10 } },
      },
      activeBoosts: [
        {
          id: "boost-1",
          name: "Coup de feu",
          description: "+25 % idées",
          effect: { ideasMultiplier: 0.25 },
          expiresAt: 20_000,
        },
      ],
    };

    const rehydrated = rehydrateSavedGame(state);

    expect(rehydrated.completedMissionIds).toEqual(["guided-first-intern"]);
    expect(rehydrated.activeMission?.id).toBe("guided-first-ideas");
    expect(rehydrated.activeBoosts[0]?.id).toBe("boost-1");
  });

  it("refreshes saved mission copy when wording changes", () => {
    const state = {
      ...createInitialGameState(1_000),
      talentPoints: 1,
      resources: {
        ...createInitialGameState(1_000).resources,
        reputation: 100,
      },
      activeMission: {
        id: "dynamic-skill-organization",
        templateId: "unlock-skill",
        kind: "dynamic" as const,
        title: "La bonne habitude",
        description: "Débloque Organisation. La compétence préfère être invitée.",
        emoji: "📋",
        requirement: { kind: "skillUnlocked" as const, skillId: "organization" },
        reward: { resources: { budget: 40 } },
      },
      log: ["Synergie découverte : Développeur caféiné."],
    };

    const rehydrated = rehydrateSavedGame(state);

    expect(rehydrated.activeMission?.description).toBe(
      "Achète Organisation. La compétence préfère être invitée.",
    );
    expect(rehydrated.log.join(" ")).toContain("Combo découvert");
    expect(rehydrated.log.join(" ")).not.toContain("Synergie découverte");
  });

  it("advances stale tutorial missions immediately when an older save already satisfies them", () => {
    const state = createInitialGameState(1_000);
    const olderSave = {
      ...state,
      workers: state.workers.map((worker) =>
        worker.id === "intern" ? { ...worker, count: 1 } : worker,
      ),
    };
    delete (olderSave as Partial<typeof olderSave>).activeMission;
    delete (olderSave as Partial<typeof olderSave>).completedMissionIds;

    const rehydrated = rehydrateSavedGame(olderSave);

    expect(rehydrated.completedMissionIds).toContain("guided-first-intern");
    expect(rehydrated.activeMission?.id).toBe("guided-first-ideas");
  });
});
