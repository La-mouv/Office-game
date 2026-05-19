import { describe, expect, it } from "vitest";
import {
  buyOrUpgradeLocation,
  buyWorker,
  createInitialGameState,
  unlockSkill,
  useManualAction,
} from "../src/lib/incrementalGame";
import {
  createNextMission,
  getEligibleDynamicMissions,
  missionRequirementMet,
} from "../src/lib/incrementalMissions";
import type { GameState } from "../src/types/incremental";

function withTutorialDone(state: GameState): GameState {
  return {
    ...state,
    activeMission: null,
    completedMissionIds: [
      "guided-first-intern",
      "guided-first-ideas",
      "guided-first-pitch",
      "guided-coffee-machine",
      "guided-first-skill",
    ],
  };
}

describe("incremental missions", () => {
  it("starts with the first guided mission and advances through the opening sequence", () => {
    let state = createInitialGameState(1_000);

    expect(state.activeMission?.id).toBe("guided-first-intern");

    state = buyWorker(state, "intern", 2_000);
    expect(state.completedMissionIds).toContain("guided-first-intern");
    expect(state.activeMission?.id).toBe("guided-first-ideas");
    expect(state.resources.budget).toBe(50);

    state = {
      ...state,
      resources: {
        ...state.resources,
        ideas: 25,
      },
    };
    state = useManualAction(state, "brainstorm", 5_000);
    expect(state.completedMissionIds).toContain("guided-first-ideas");
    expect(state.activeMission?.id).toBe("guided-first-pitch");

    state = useManualAction(state, "client-pitch", 10_000);
    expect(state.completedMissionIds).toContain("guided-first-pitch");
    expect(state.activeMission?.id).toBe("guided-coffee-machine");

    state = {
      ...state,
      resources: {
        ...state.resources,
        reputation: 60,
        budget: 200,
      },
    };
    state = buyOrUpgradeLocation(state, "coffee-machine", 11_000);
    expect(state.completedMissionIds).toContain("guided-coffee-machine");
    expect(state.activeMission?.id).toBe("guided-first-skill");

    state = {
      ...state,
      talentPoints: 1,
    };
    state = unlockSkill(state, "organization", 12_000, () => 0);
    expect(state.completedMissionIds).toContain("guided-first-skill");
    expect(state.activeMission?.kind).toBe("dynamic");
  });

  it("does not grant the same guided mission reward twice", () => {
    let state = createInitialGameState(1_000);
    state = buyWorker(state, "intern", 2_000);
    const afterFirstCompletionBudget = state.resources.budget;

    state = buyWorker(state, "intern", 3_000);

    expect(state.completedMissionIds.filter((id) => id === "guided-first-intern")).toHaveLength(1);
    expect(state.resources.budget).toBe(afterFirstCompletionBudget - 11);
  });

  it("only offers dynamic missions that are possible from the current state", () => {
    const state = withTutorialDone(createInitialGameState(1_000));
    const missionTemplateIds = getEligibleDynamicMissions(state).map((mission) => mission.templateId);

    expect(missionTemplateIds).toContain("brainstorm-burst");
    expect(missionTemplateIds).toContain("pitch-round");
    expect(missionTemplateIds).not.toContain("build-next-room");
    expect(missionTemplateIds).not.toContain("unlock-skill");
  });

  it("avoids repeating the same dynamic template when another option exists", () => {
    const state = {
      ...withTutorialDone(createInitialGameState(1_000)),
      lastMissionTemplateId: "brainstorm-burst",
    };

    const mission = createNextMission(state, () => 0);

    expect(mission?.templateId).not.toBe("brainstorm-burst");
  });

  it("marks generated dynamic mission requirements using future targets", () => {
    const state = {
      ...withTutorialDone(createInitialGameState(1_000)),
      manualActionUseCounts: { brainstorm: 4 },
    };
    const mission = getEligibleDynamicMissions(state).find(
      (candidate) => candidate.templateId === "brainstorm-burst",
    );

    expect(mission?.requirement).toEqual({
      kind: "manualActionUses",
      actionId: "brainstorm",
      count: 7,
    });
    expect(mission && missionRequirementMet(state, mission)).toBe(false);
  });
});
