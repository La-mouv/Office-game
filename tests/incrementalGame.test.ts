import { describe, expect, it } from "vitest";
import {
  buyOrUpgradeLocation,
  buyWorker,
  calculateProduction,
  checkCompletion,
  createInitialGameState,
  gameTick,
  getManualActionCost,
  getLocationCost,
  getWorkerCost,
  getWorkerUpgradeCost,
  maybeTriggerIncident,
  resolveIncidentChoice,
  unlockSkill,
  updateMilestones,
  updateSynergies,
  upgradeWorker,
  useManualAction,
} from "../src/lib/incrementalGame";
import type { GameState } from "../src/types/incremental";

function withBudget(state: GameState, budget: number): GameState {
  return {
    ...state,
    resources: {
      ...state.resources,
      budget,
    },
  };
}

describe("incremental office rules", () => {
  it("creates a playable incremental initial state", () => {
    const state = createInitialGameState(1_000);

    expect(state.resources).toEqual({
      ideas: 0,
      budget: 50,
      ambiance: 50,
      reputation: 0,
      chaos: 0,
    });
    expect(state.workers.find((worker) => worker.id === "intern")?.count).toBe(0);
    expect(state.locations.find((location) => location.id === "starting-office")?.owned).toBe(
      true,
    );
    expect(state.manualActions).toHaveLength(3);
    expect(state.manualActions.map((action) => action.id)).not.toContain("team-sprint");
    expect(state.highestRewardedReputationLevel).toBe(1);
    expect(state.log.at(-1)).toContain("Bienvenue");
  });

  it("starts with a cheap active loop that turns ideas into budget and reputation", () => {
    let state = createInitialGameState(1_000);
    const pitch = state.manualActions.find((action) => action.id === "client-pitch")!;

    expect(getManualActionCost(pitch)).toEqual({ ideas: 25 });
    expect(pitch.effect).toEqual({ budget: 30, reputation: 15 });

    state = {
      ...state,
      resources: {
        ...state.resources,
        ideas: 25,
      },
    };

    state = useManualAction(state, "client-pitch", 10_000);

    expect(state.resources.ideas).toBe(0);
    expect(state.resources.budget).toBe(80);
    expect(state.resources.reputation).toBe(15);
  });

  it("calculates automatic production with locations, synergies, skills, ambiance, and chaos", () => {
    let state = createInitialGameState(1_000);
    state = {
      ...state,
      resources: {
        ...state.resources,
        ambiance: 80,
        chaos: 30,
      },
      workers: state.workers.map((worker) => {
        if (worker.id === "intern") return { ...worker, count: 2 };
        if (worker.id === "tired-dev") return { ...worker, count: 1 };
        return worker;
      }),
      locations: state.locations.map((location) =>
        location.id === "coffee-machine" ? { ...location, owned: true } : location,
      ),
      skills: state.skills.map((skill) =>
        skill.id === "organization" ? { ...skill, unlocked: true } : skill,
      ),
    };
    state = updateSynergies(state);

    const production = calculateProduction(state);

    expect(production.activeSynergyIds).toContain("caffeinated-dev");
    expect(production.activeSkillIds).toContain("organization");
    expect(production.multipliers).toMatchObject({
      ambiance: 1.15,
      chaos: 0.95,
      ideas: 1.55,
      global: 1,
    });
    expect(production.perSecond.ideas).toBeCloseTo(11.853625, 5);
  });

  it("applies active mission boosts to production and expires them during ticks", () => {
    let state = createInitialGameState(1_000);
    state = {
      ...state,
      workers: state.workers.map((worker) =>
        worker.id === "intern" ? { ...worker, count: 2 } : worker,
      ),
      activeBoosts: [
        {
          id: "test-ideas-boost",
          name: "Post-its inspirés",
          description: "+25 % idées",
          effect: { ideasMultiplier: 0.25 },
          expiresAt: 3_000,
        },
      ],
    };

    expect(calculateProduction(state).multipliers.ideas).toBeCloseTo(1.3, 5);

    state = gameTick(state, 3_001, () => 0);

    expect(state.activeBoosts).toHaveLength(0);
    expect(calculateProduction(state).multipliers.ideas).toBeCloseTo(1.05, 5);
  });

  it("uses escalating costs and blocks locked or unaffordable purchases", () => {
    let state = createInitialGameState(1_000);
    const intern = state.workers.find((worker) => worker.id === "intern");
    const openSpace = state.locations.find((location) => location.id === "open-space");

    expect(intern && getWorkerCost(intern)).toBe(10);
    expect(openSpace && getLocationCost(openSpace)).toBe(90);

    state = buyWorker(state, "intern");
    expect(state.resources.budget).toBe(50);
    expect(state.workers.find((worker) => worker.id === "intern")?.count).toBe(1);
    expect(getWorkerCost(state.workers.find((worker) => worker.id === "intern")!)).toBe(11);

    const lockedAttempt = buyWorker(state, "tired-dev");
    expect(lockedAttempt.workers.find((worker) => worker.id === "tired-dev")?.count).toBe(0);
    expect(lockedAttempt.log.at(-1)).toContain("verrouillé");

    const poorState = {
      ...withBudget(state, 0),
      resources: {
        ...withBudget(state, 0).resources,
        reputation: 50,
      },
    };
    const unaffordableAttempt = buyOrUpgradeLocation(poorState, "coffee-machine");
    expect(unaffordableAttempt.locations.find((location) => location.id === "coffee-machine")?.owned)
      .toBe(false);
    expect(unaffordableAttempt.log.at(-1)).toContain("Pas assez de budget");
  });

  it("builds and upgrades locations while increasing their price", () => {
    let state = createInitialGameState(1_000);
    state = {
      ...withBudget(state, 1_000),
      resources: {
        ...withBudget(state, 1_000).resources,
        reputation: 150,
      },
    };

    state = buyOrUpgradeLocation(state, "open-space");
    expect(state.locations.find((location) => location.id === "open-space")).toMatchObject({
      owned: true,
      level: 1,
    });
    expect(state.resources.budget).toBe(910);

    state = buyOrUpgradeLocation(state, "open-space");
    expect(state.locations.find((location) => location.id === "open-space")).toMatchObject({
      owned: true,
      level: 2,
    });
    expect(getLocationCost(state.locations.find((location) => location.id === "open-space")!)).toBe(
      180,
    );
  });

  it("upgrades workers through level five and uses the PRD cost curve", () => {
    let state = withBudget(createInitialGameState(1_000), 10_000);
    const intern = state.workers.find((worker) => worker.id === "intern")!;

    expect(getWorkerUpgradeCost(intern)).toBe(100);

    state = upgradeWorker(state, "intern");
    expect(state.workers.find((worker) => worker.id === "intern")?.level).toBe(2);
    expect(state.resources.budget).toBe(9_900);
  });

  it("discovers synergies automatically when requirements are met", () => {
    let state = createInitialGameState(1_000);
    state = {
      ...state,
      workers: state.workers.map((worker) =>
        worker.id === "intern" ? { ...worker, count: 5 } : worker,
      ),
      locations: state.locations.map((location) =>
        location.id === "open-space" ? { ...location, owned: true } : location,
      ),
    };

    state = updateSynergies(state);

    expect(state.synergies.find((synergy) => synergy.id === "junior-team")?.discovered).toBe(
      true,
    );
  });

  it("triggers incidents on schedule and does not stack a second active incident", () => {
    let state = createInitialGameState(1_000);

    state = maybeTriggerIncident(state, 91_000, () => 0);
    expect(state.activeIncident?.id).toBe("coffee-noise");

    const unchanged = maybeTriggerIncident(state, 200_000, () => 0.9);
    expect(unchanged.activeIncident?.id).toBe("coffee-noise");
  });

  it("resolves deterministic incident choices including RNG-based outcomes", () => {
    let state = createInitialGameState(1_000);
    state = {
      ...state,
      activeIncident: {
        id: "coffee-noise",
        title: "Machine à café suspecte",
        description: "Test",
        emoji: "☕",
        choices: [
          {
            id: "hit",
            label: "Taper",
            effect: {},
            chance: {
              successRate: 0.5,
              successEffect: { ambiance: 5, budget: 20 },
              failEffect: { ambiance: -10, chaos: 10 },
            },
          },
        ],
      },
    };

    state = resolveIncidentChoice(state, "coffee-noise", "hit", () => 0.1);

    expect(state.resources.ambiance).toBe(55);
    expect(state.resources.budget).toBe(70);
    expect(state.activeIncident).toBeNull();
  });

  it("applies manual actions and respects cooldowns", () => {
    let state = createInitialGameState(1_000);

    state = useManualAction(state, "brainstorm", 10_000);
    expect(state.resources.ideas).toBe(12);

    const blocked = useManualAction(state, "brainstorm", 12_999);
    expect(blocked.resources.ideas).toBe(12);

    const readyAgain = useManualAction(blocked, "brainstorm", 13_000);
    expect(readyAgain.resources.ideas).toBe(24);
  });

  it("refuses manual actions when their resource cost is missing", () => {
    const state = createInitialGameState(1_000);
    const blocked = useManualAction(state, "client-pitch", 10_000);

    expect(blocked.resources).toEqual(state.resources);
    expect(blocked.log.at(-1)).toContain("Pas assez d’idées");
  });

  it("awards talent points once per new reputation level and unlocks skills", () => {
    let state = createInitialGameState(1_000);
    state = {
      ...state,
      resources: {
        ...state.resources,
        ambiance: 51,
        reputation: 49,
      },
      workers: state.workers.map((worker) =>
        worker.id === "senior-dev" ? { ...worker, count: 2 } : worker,
      ),
    };

    state = gameTick(state, 2_000);
    expect(state.resources.reputation).toBeCloseTo(50, 5);
    expect(state.talentPoints).toBe(1);

    const repeated = gameTick(state, 3_000);
    expect(repeated.talentPoints).toBe(1);

    const skillReady = {
      ...repeated,
      resources: {
        ...repeated.resources,
        reputation: 50,
      },
    };
    const unlocked = unlockSkill(skillReady, "organization");
    expect(unlocked.skills.find((skill) => skill.id === "organization")?.unlocked).toBe(true);
    expect(unlocked.talentPoints).toBe(0);
  });

  it("achieves milestones only once and checks the final completion goal", () => {
    let state = createInitialGameState(1_000);
    state = {
      ...state,
      workers: state.workers.map((worker) =>
        worker.id === "intern" ? { ...worker, count: 10 } : worker,
      ),
    };

    const once = updateMilestones(state);
    const twice = updateMilestones(once);

    expect(once.milestones.find((milestone) => milestone.id === "ten-interns")?.achieved).toBe(
      true,
    );
    expect(twice.log).toHaveLength(once.log.length);

    const complete = checkCompletion(
      {
        ...twice,
        resources: {
          ...twice.resources,
          reputation: 1_000_000,
        },
        locations: twice.locations.map((location) =>
          location.id === "autonomous-office" ? { ...location, owned: true } : location,
        ),
        synergies: twice.synergies.map((synergy) =>
          synergy.id === "office-autopilot" ? { ...synergy, discovered: true } : synergy,
        ),
      },
      123_456,
    );

    expect(complete.completed).toBe(true);
    expect(complete.completedAt).toBe(123_456);
  });
});
