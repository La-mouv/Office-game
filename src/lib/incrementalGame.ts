import {
  INCIDENTS,
  LOCATIONS,
  MANUAL_ACTIONS,
  MILESTONES,
  SKILLS,
  STARTING_RESOURCES,
  SYNERGIES,
  WORKERS,
} from "@/lib/incrementalData";
import { createNextMission, missionRequirementMet } from "@/lib/incrementalMissions";
import type {
  ActiveBoost,
  GameState,
  Incident,
  Milestone,
  OfficeLocation,
  ProductionSummary,
  Resources,
  Skill,
  Synergy,
  Worker,
} from "@/types/incremental";

export const INCIDENT_INTERVAL_MS = 90_000;

function clone<T>(value: T): T {
  return structuredClone(value);
}

export function appendLog(state: GameState, message: string): GameState {
  return {
    ...state,
    log: [...state.log, message].slice(-8),
  };
}

export function createInitialGameState(now = Date.now()): GameState {
  const initialState: GameState = {
    resources: clone(STARTING_RESOURCES),
    workers: clone(WORKERS),
    locations: clone(LOCATIONS),
    synergies: clone(SYNERGIES),
    skills: clone(SKILLS),
    milestones: clone(MILESTONES),
    manualActions: clone(MANUAL_ACTIONS),
    manualActionUseCounts: {},
    activeMission: null,
    completedMissionIds: [],
    activeBoosts: [],
    activeIncident: null,
    lastIncidentAt: now,
    startedAt: now,
    lastTickAt: now,
    completedAt: null,
    totalIdeasEarned: 0,
    totalBudgetEarned: 0,
    totalReputationEarned: 0,
    talentPoints: 0,
    highestRewardedReputationLevel: 1,
    completed: false,
    sandboxMode: false,
    lost: false,
    lostAt: null,
    log: ["Bienvenue dans Office Village. L’open-space respire encore, le chaos demande déjà un badge."],
  };

  return {
    ...initialState,
    activeMission: createNextMission(initialState, () => 0),
  };
}

export function resetGame(now = Date.now()): GameState {
  return createInitialGameState(now);
}

export function getAmbianceMultiplier(ambiance: number): number {
  if (ambiance >= 91) return 1.35;
  if (ambiance >= 76) return 1.15;
  if (ambiance >= 51) return 1;
  if (ambiance >= 26) return 0.9;
  return 0.75;
}

export function getChaosMultiplier(chaos: number): number {
  if (chaos >= 76) return 0.8;
  if (chaos >= 51) return 0.9;
  if (chaos >= 26) return 0.95;
  return 1;
}

export function getIncidentInterval(chaos: number): number {
  if (chaos >= 76) return 45_000;
  if (chaos >= 51) return 60_000;
  if (chaos >= 26) return 75_000;
  return INCIDENT_INTERVAL_MS;
}

export function getReputationLevel(reputation: number): number {
  if (reputation >= 1_000_000) return 14;
  if (reputation >= 250_000) return 13;
  if (reputation >= 100_000) return 12;
  if (reputation >= 40_000) return 11;
  if (reputation >= 20_000) return 10;
  if (reputation >= 10_000) return 9;
  if (reputation >= 6_000) return 8;
  if (reputation >= 3_000) return 7;
  if (reputation >= 1_500) return 6;
  if (reputation >= 800) return 5;
  if (reputation >= 400) return 4;
  if (reputation >= 150) return 3;
  if (reputation >= 50) return 2;
  return 1;
}

export function getWorkerCost(worker: Worker): number {
  return Math.floor(worker.baseCost * Math.pow(1.15, worker.count));
}

export function getLocationCost(location: OfficeLocation): number {
  return Math.floor(location.baseCost * Math.pow(2, location.level - 1));
}

export function getWorkerUpgradeCost(worker: Worker): number {
  return Math.floor(worker.baseCost * 10 * worker.level * Math.pow(2, worker.level - 1));
}

export function getManualActionCost(action: GameState["manualActions"][number]): Partial<Resources> {
  return action.cost ?? {};
}

export function getWorkerLevelMultiplier(level: number): number {
  if (level >= 5) return 25;
  if (level === 4) return 10;
  if (level === 3) return 5;
  if (level === 2) return 2;
  return 1;
}

function minimumAmbianceFromSkills(skills: Skill[]): number {
  return skills
    .filter((skill) => skill.unlocked)
    .reduce((current, skill) => Math.max(current, skill.effect.minAmbiance ?? 0), 0);
}

export function clampResources(resources: Resources, skills: Skill[] = []): Resources {
  const minimumAmbiance = minimumAmbianceFromSkills(skills);

  return {
    ideas: Math.max(0, resources.ideas),
    budget: Math.max(0, resources.budget),
    ambiance: Math.min(100, Math.max(minimumAmbiance, resources.ambiance)),
    reputation: Math.max(0, resources.reputation),
    chaos: Math.min(100, Math.max(0, resources.chaos)),
  };
}

function applyResourceDelta(state: GameState, delta: Partial<Resources>): GameState {
  const nextResources = clampResources(
    {
      ideas: state.resources.ideas + (delta.ideas ?? 0),
      budget: state.resources.budget + (delta.budget ?? 0),
      ambiance: state.resources.ambiance + (delta.ambiance ?? 0),
      reputation: state.resources.reputation + (delta.reputation ?? 0),
      chaos: state.resources.chaos + (delta.chaos ?? 0),
    },
    state.skills,
  );

  const nextLevel = getReputationLevel(nextResources.reputation);
  const gainedTalentPoints = Math.max(0, nextLevel - state.highestRewardedReputationLevel);

  return {
    ...state,
    resources: nextResources,
    totalIdeasEarned: state.totalIdeasEarned + Math.max(0, delta.ideas ?? 0),
    totalBudgetEarned: state.totalBudgetEarned + Math.max(0, delta.budget ?? 0),
    totalReputationEarned: state.totalReputationEarned + Math.max(0, delta.reputation ?? 0),
    talentPoints: state.talentPoints + gainedTalentPoints,
    highestRewardedReputationLevel: Math.max(
      state.highestRewardedReputationLevel,
      nextLevel,
    ),
  };
}

function canAffordResources(resources: Resources, cost: Partial<Resources>): boolean {
  return (Object.keys(cost) as (keyof Resources)[]).every(
    (resource) => resources[resource] >= (cost[resource] ?? 0),
  );
}

function payResourceCost(state: GameState, cost: Partial<Resources>): GameState {
  return applyResourceDelta(state, {
    ideas: -(cost.ideas ?? 0),
    budget: -(cost.budget ?? 0),
    ambiance: -(cost.ambiance ?? 0),
    reputation: -(cost.reputation ?? 0),
    chaos: -(cost.chaos ?? 0),
  });
}

function firstMissingResource(
  resources: Resources,
  cost: Partial<Resources>,
): keyof Resources | undefined {
  return (Object.keys(cost) as (keyof Resources)[]).find(
    (resource) => resources[resource] < (cost[resource] ?? 0),
  );
}

function getResourceName(resource: keyof Resources): string {
  if (resource === "ideas") return "d’idées";
  if (resource === "budget") return "de budget";
  if (resource === "ambiance") return "d’ambiance";
  if (resource === "reputation") return "de réputation";
  return "de chaos";
}

function sumMultiplierEffects(
  state: GameState,
): Pick<
  ProductionSummary["multipliers"],
  "ideas" | "budget" | "reputation" | "global"
> & { chaosReduction: number } {
  const ownedLocations = state.locations.filter((location) => location.owned);
  const activeSynergies = state.synergies.filter((synergy) => synergy.discovered);
  const activeSkills = state.skills.filter((skill) => skill.unlocked);
  const achievedMilestones = state.milestones.filter((milestone) => milestone.achieved);
  const activeBoosts = state.activeBoosts;

  const fromLocations = ownedLocations.reduce(
    (totals, location) => ({
      ideas: totals.ideas + (location.effect.ideasMultiplier ?? 0) * location.level,
      budget: totals.budget + (location.effect.budgetMultiplier ?? 0) * location.level,
      reputation:
        totals.reputation + (location.effect.reputationMultiplier ?? 0) * location.level,
      global: totals.global + (location.effect.globalMultiplier ?? 0) * location.level,
      chaosReduction:
        totals.chaosReduction + (location.effect.chaosReduction ?? 0) * location.level,
    }),
    { ideas: 0, budget: 0, reputation: 0, global: 0, chaosReduction: 0 },
  );

  const addSimpleEffects = (
    totals: typeof fromLocations,
    effect:
      | Synergy["effect"]
      | Skill["effect"]
      | Milestone["reward"]
      | ActiveBoost["effect"],
  ): typeof fromLocations => ({
    ideas: totals.ideas + (effect.ideasMultiplier ?? 0),
    budget: totals.budget + (effect.budgetMultiplier ?? 0),
    reputation: totals.reputation + (effect.reputationMultiplier ?? 0),
    global: totals.global + (effect.globalMultiplier ?? 0),
    chaosReduction: totals.chaosReduction + ("chaosReduction" in effect ? effect.chaosReduction ?? 0 : 0),
  });

  return [...activeSynergies, ...activeSkills, ...achievedMilestones, ...activeBoosts].reduce(
    (totals, item) => addSimpleEffects(totals, "effect" in item ? item.effect : item.reward),
    fromLocations,
  );
}

export function calculateProduction(state: GameState): ProductionSummary {
  const workerProduction = state.workers.reduce<Resources>(
    (totals, worker) => {
      const levelMultiplier = getWorkerLevelMultiplier(worker.level);

      return {
        ideas:
          totals.ideas + (worker.baseProduction.ideas ?? 0) * worker.count * levelMultiplier,
        budget:
          totals.budget + (worker.baseProduction.budget ?? 0) * worker.count * levelMultiplier,
        ambiance:
          totals.ambiance +
          (worker.baseProduction.ambiance ?? 0) * worker.count * levelMultiplier,
        reputation:
          totals.reputation +
          (worker.baseProduction.reputation ?? 0) * worker.count * levelMultiplier,
        chaos:
          totals.chaos + (worker.baseProduction.chaos ?? 0) * worker.count * levelMultiplier,
      };
    },
    { ideas: 0, budget: 0, ambiance: 0, reputation: 0, chaos: 0 },
  );

  const ownedLocations = state.locations.filter((location) => location.owned);
  const locationBudget = ownedLocations.reduce(
    (total, location) => total + (location.effect.budgetPerSecond ?? 0) * location.level,
    0,
  );
  const locationChaos = ownedLocations.reduce(
    (total, location) => total + (location.effect.chaosPerSecond ?? 0) * location.level,
    0,
  );
  const effectTotals = sumMultiplierEffects(state);
  const ambianceMultiplier = getAmbianceMultiplier(state.resources.ambiance);
  const chaosMultiplier = getChaosMultiplier(state.resources.chaos);
  const ideasMultiplier = 1 + effectTotals.ideas;
  const budgetMultiplier = 1 + effectTotals.budget;
  const reputationMultiplier = 1 + effectTotals.reputation;
  const globalMultiplier = 1 + effectTotals.global;

  return {
    perSecond: {
      ideas:
        workerProduction.ideas *
        ideasMultiplier *
        globalMultiplier *
        ambianceMultiplier *
        chaosMultiplier,
      budget:
        (workerProduction.budget + locationBudget) *
        budgetMultiplier *
        globalMultiplier *
        ambianceMultiplier *
        chaosMultiplier,
      reputation:
        workerProduction.reputation *
        reputationMultiplier *
        globalMultiplier *
        ambianceMultiplier *
        chaosMultiplier,
      ambiance: workerProduction.ambiance,
      chaos: workerProduction.chaos + locationChaos - effectTotals.chaosReduction,
    },
    multipliers: {
      ambiance: ambianceMultiplier,
      chaos: chaosMultiplier,
      ideas: ideasMultiplier,
      budget: budgetMultiplier,
      reputation: reputationMultiplier,
      global: globalMultiplier,
    },
    activeSynergyIds: state.synergies.filter((synergy) => synergy.discovered).map((synergy) => synergy.id),
    activeSkillIds: state.skills.filter((skill) => skill.unlocked).map((skill) => skill.id),
  };
}

export function updateSynergies(state: GameState): GameState {
  let nextState = state;

  const synergies = state.synergies.map((synergy) => {
    if (synergy.discovered) return synergy;

    const workersMet = Object.entries(synergy.requirements.workers ?? {}).every(
      ([workerId, requiredCount]) =>
        (state.workers.find((worker) => worker.id === workerId)?.count ?? 0) >= requiredCount,
    );
    const locationsMet = (synergy.requirements.locations ?? []).every(
      (locationId) => state.locations.find((location) => location.id === locationId)?.owned,
    );

    if (!workersMet || !locationsMet) return synergy;

    nextState = applyResourceDelta(nextState, {
      ambiance: synergy.effect.ambianceBonus ?? 0,
    });
    nextState = appendLog(nextState, `Combo découvert : ${synergy.name}. Le bureau prétend que c’était prévu.`);
    return { ...synergy, discovered: true };
  });

  return {
    ...nextState,
    synergies,
  };
}

function milestoneReached(state: GameState, milestone: Milestone): boolean {
  const { condition } = milestone;
  if (condition.workerCount) {
    const worker = state.workers.find((candidate) => candidate.id === condition.workerCount?.workerId);
    if ((worker?.count ?? 0) < condition.workerCount.count) return false;
  }
  if (condition.locationOwned) {
    const location = state.locations.find((candidate) => candidate.id === condition.locationOwned);
    if (!location?.owned) return false;
  }
  if (condition.totalIdeas !== undefined && state.totalIdeasEarned < condition.totalIdeas) {
    return false;
  }
  if (condition.totalBudget !== undefined && state.totalBudgetEarned < condition.totalBudget) {
    return false;
  }
  if (condition.reputation !== undefined && state.resources.reputation < condition.reputation) {
    return false;
  }
  if (condition.ambiance !== undefined && state.resources.ambiance < condition.ambiance) {
    return false;
  }
  if (
    condition.synergiesCount !== undefined &&
    state.synergies.filter((synergy) => synergy.discovered).length < condition.synergiesCount
  ) {
    return false;
  }
  return true;
}

export function updateMilestones(state: GameState): GameState {
  let nextState = state;

  const milestones = state.milestones.map((milestone) => {
    if (milestone.achieved || !milestoneReached(nextState, milestone)) return milestone;

    nextState = applyResourceDelta(nextState, milestone.reward.resources ?? {});
    nextState = appendLog(nextState, `Palier validé : ${milestone.title}. Le reporting gonfle les épaules.`);
    return { ...milestone, achieved: true };
  });

  return {
    ...nextState,
    milestones,
  };
}

function expireBoosts(state: GameState, now: number): GameState {
  const activeBoosts = state.activeBoosts.filter((boost) => boost.expiresAt > now);
  if (activeBoosts.length === state.activeBoosts.length) return state;

  return {
    ...state,
    activeBoosts,
  };
}

function grantMissionBoost(
  state: GameState,
  boost: Omit<ActiveBoost, "expiresAt"> & { durationMs: number },
  now: number,
): GameState {
  return {
    ...state,
    activeBoosts: [
      ...state.activeBoosts.filter((activeBoost) => activeBoost.id !== boost.id),
      {
        id: boost.id,
        name: boost.name,
        description: boost.description,
        effect: boost.effect,
        expiresAt: now + boost.durationMs,
      },
    ],
  };
}

export function updateMissions(
  state: GameState,
  now = Date.now(),
  rng: () => number = Math.random,
): GameState {
  let nextState = state.activeMission
    ? state
    : {
        ...state,
        activeMission: createNextMission(state, rng),
      };

  for (let index = 0; index < 10; index += 1) {
    const mission = nextState.activeMission;
    if (!mission || !missionRequirementMet(nextState, mission)) break;

    if (!nextState.completedMissionIds.includes(mission.id)) {
      nextState = applyResourceDelta(nextState, mission.reward.resources ?? {});
      if (mission.reward.boost) {
        nextState = grantMissionBoost(nextState, mission.reward.boost, now);
      }
      nextState = appendLog(nextState, `Mission pliée : ${mission.title}. Le comité applaudit en silence.`);
      nextState = {
        ...nextState,
        completedMissionIds: [...nextState.completedMissionIds, mission.id],
      };
    }

    nextState = {
      ...nextState,
      activeMission: null,
      lastMissionTemplateId: mission.templateId,
    };
    nextState = {
      ...nextState,
      activeMission: createNextMission(nextState, rng),
    };
  }

  return nextState;
}

export function gameTick(
  state: GameState,
  now = Date.now(),
  rng: () => number = Math.random,
): GameState {
  if (state.completed || state.lost) {
    return {
      ...state,
      lastTickAt: now,
    };
  }

  const elapsedSeconds = Math.max(0, (now - state.lastTickAt) / 1000);
  if (elapsedSeconds <= 0) return checkRunEnd(expireBoosts(state, now), now);

  let nextState = expireBoosts(state, now);
  nextState = updateSynergies(nextState);
  const production = calculateProduction(nextState);
  nextState = applyResourceDelta(nextState, {
    ideas: (production.perSecond.ideas ?? 0) * elapsedSeconds,
    budget: (production.perSecond.budget ?? 0) * elapsedSeconds,
    reputation: (production.perSecond.reputation ?? 0) * elapsedSeconds,
    ambiance: (production.perSecond.ambiance ?? 0) * elapsedSeconds,
    chaos: (production.perSecond.chaos ?? 0) * elapsedSeconds,
  });
  nextState = {
    ...nextState,
    lastTickAt: now,
  };
  nextState = updateMilestones(nextState);
  nextState = maybeTriggerIncident(nextState, now, rng);
  nextState = updateMissions(nextState, now, rng);
  return checkRunEnd(nextState, now);
}

export function getRunElapsedMs(state: GameState, now = Date.now()): number {
  const endpoint =
    state.completed
      ? (state.completedAt ?? state.lastTickAt)
      : state.lost
        ? (state.lostAt ?? state.lastTickAt)
        : now;
  return Math.max(0, endpoint - state.startedAt);
}

export function resumeRunTimer(state: GameState, now = Date.now()): GameState {
  if (state.completed || state.lost) {
    return {
      ...state,
      lastTickAt: now,
    };
  }

  const elapsedBeforePause = Math.max(0, state.lastTickAt - state.startedAt);

  return {
    ...state,
    startedAt: now - elapsedBeforePause,
    lastTickAt: now,
  };
}

export function buyWorker(
  state: GameState,
  workerId: string,
  now = Date.now(),
  rng: () => number = Math.random,
): GameState {
  if (state.completed || state.lost) return state;

  const worker = state.workers.find((candidate) => candidate.id === workerId);
  if (!worker) return state;
  if (state.resources.reputation < worker.unlockReputation) {
    return appendLog(state, `${worker.name} reste verrouillé. Le badge refuse l’accès.`);
  }

  const cost = getWorkerCost(worker);
  if (state.resources.budget < cost) {
    return appendLog(state, `Pas assez de budget pour recruter ${worker.name}. La finance garde le mug fermé.`);
  }

  let nextState: GameState = {
    ...state,
    workers: state.workers.map((candidate) =>
      candidate.id === workerId ? { ...candidate, count: candidate.count + 1 } : candidate,
    ),
  };
  nextState = applyResourceDelta(nextState, { budget: -cost });
  nextState = appendLog(nextState, `${worker.name} rejoint le bureau. Quelqu’un ajoute une chaise au plan.`);
  nextState = updateSynergies(nextState);
  nextState = updateMilestones(nextState);
  nextState = updateMissions(nextState, now, rng);
  return checkRunEnd(nextState, now);
}

export function upgradeWorker(
  state: GameState,
  workerId: string,
  now = Date.now(),
  rng: () => number = Math.random,
): GameState {
  if (state.completed || state.lost) return state;

  const worker = state.workers.find((candidate) => candidate.id === workerId);
  if (!worker) return state;
  if (state.resources.reputation < worker.unlockReputation) {
    return appendLog(state, `${worker.name} reste verrouillé. Le badge refuse l’accès.`);
  }
  if (worker.level >= 5) {
    return appendLog(state, `${worker.name} est déjà au niveau maximum. Même le manager lâche l’affaire.`);
  }

  const cost = getWorkerUpgradeCost(worker);
  if (state.resources.budget < cost) {
    return appendLog(state, `Pas assez de budget pour améliorer ${worker.name}. Le fichier Excel dit non.`);
  }

  let nextState: GameState = {
    ...state,
    workers: state.workers.map((candidate) =>
      candidate.id === workerId ? { ...candidate, level: candidate.level + 1 } : candidate,
    ),
  };
  nextState = applyResourceDelta(nextState, { budget: -cost });
  nextState = appendLog(nextState, `${worker.name} passe niveau ${worker.level + 1}. La fiche de poste fait semblant de suivre.`);
  return checkRunEnd(updateMissions(nextState, now, rng), now);
}

export function buyOrUpgradeLocation(
  state: GameState,
  locationId: string,
  now = Date.now(),
  rng: () => number = Math.random,
): GameState {
  if (state.completed || state.lost) return state;

  const location = state.locations.find((candidate) => candidate.id === locationId);
  if (!location) return state;
  if (state.resources.reputation < location.unlockReputation) {
    return appendLog(state, `${location.name} reste verrouillé. Le badge d’accès boude.`);
  }
  if (location.owned && location.level >= location.maxLevel) {
    return appendLog(state, `${location.name} est déjà au niveau maximum. Le plan des locaux capitule.`);
  }

  const cost = getLocationCost(location);
  if (state.resources.budget < cost) {
    return appendLog(state, `Pas assez de budget pour ${location.name}. Le devis part en pause café.`);
  }

  let nextState: GameState = {
    ...state,
    locations: state.locations.map((candidate) => {
      if (candidate.id !== locationId) return candidate;
      return candidate.owned
        ? { ...candidate, level: candidate.level + 1 }
        : { ...candidate, owned: true };
    }),
  };
  nextState = applyResourceDelta(nextState, {
    budget: -cost,
    ambiance: location.effect.ambianceBonus ?? 0,
  });
  nextState = appendLog(
    nextState,
    location.owned
      ? `${location.name} passe niveau ${location.level + 1}. Les murs prennent confiance.`
      : `${location.name} construit. Le bureau gagne quelques mètres carrés d’illusion.`,
  );
  nextState = updateSynergies(nextState);
  nextState = updateMilestones(nextState);
  nextState = updateMissions(nextState, now, rng);
  return checkRunEnd(nextState, now);
}

export function unlockSkill(
  state: GameState,
  skillId: string,
  now = Date.now(),
  rng: () => number = Math.random,
): GameState {
  if (state.completed || state.lost) return state;

  const skill = state.skills.find((candidate) => candidate.id === skillId);
  if (!skill || skill.unlocked) return state;
  if (state.resources.reputation < skill.unlockReputation) {
    return appendLog(state, `${skill.name} reste verrouillé. Le talent attend son badge.`);
  }
  if (state.talentPoints < skill.cost) {
    return appendLog(state, `Pas assez de points de talent pour ${skill.name}. Le plan de carrière patiente.`);
  }

  let nextState: GameState = {
    ...state,
    skills: state.skills.map((candidate) =>
      candidate.id === skillId ? { ...candidate, unlocked: true } : candidate,
    ),
    talentPoints: state.talentPoints - skill.cost,
  };
  nextState = applyResourceDelta(nextState, {
    ambiance: skill.effect.ambianceBonus ?? 0,
  });
  nextState = {
    ...nextState,
    resources: clampResources(nextState.resources, nextState.skills),
  };
  nextState = appendLog(nextState, `Talent signé : ${skill.name}. Le bureau se sent soudain compétent.`);
  return checkRunEnd(updateMissions(nextState, now, rng), now);
}

export function maybeTriggerIncident(
  state: GameState,
  now: number,
  rng: () => number = Math.random,
): GameState {
  if (state.activeIncident) return state;
  if (now - state.lastIncidentAt < getIncidentInterval(state.resources.chaos)) return state;

  const eligibleIncidents = INCIDENTS.filter(
    (incident) =>
      (incident.minChaos === undefined || state.resources.chaos >= incident.minChaos) &&
      (incident.maxChaos === undefined || state.resources.chaos <= incident.maxChaos),
  );
  if (eligibleIncidents.length === 0) return state;

  const index = Math.floor(rng() * eligibleIncidents.length);
  const incident = clone(eligibleIncidents[Math.min(index, eligibleIncidents.length - 1)] as Incident);

  return appendLog(
    {
      ...state,
      activeIncident: incident,
      lastIncidentAt: now,
    },
    `Incident bureau : ${incident.title}. Le calme pose sa démission.`,
  );
}

export function resolveIncidentChoice(
  state: GameState,
  incidentId: string,
  choiceId: string,
  rng: () => number = Math.random,
  now = Date.now(),
): GameState {
  if (state.completed || state.lost) return state;

  if (!state.activeIncident || state.activeIncident.id !== incidentId) return state;
  const choice = state.activeIncident.choices.find((candidate) => candidate.id === choiceId);
  if (!choice) return state;

  let delta: Partial<Resources> = choice.effect;
  let outcome = choice.label;

  if (choice.chance) {
    const success = rng() < choice.chance.successRate;
    delta = {
      ...delta,
      ...(success ? choice.chance.successEffect : choice.chance.failEffect),
    };
    outcome = `${choice.label} — ${success ? "succès" : "raté"}`;
  }

  let nextState = applyResourceDelta(
    {
      ...state,
      activeIncident: null,
    },
    delta,
  );
  nextState = appendLog(nextState, outcome);
  nextState = updateSynergies(nextState);
  nextState = updateMilestones(nextState);
  nextState = updateMissions(nextState, now, rng);
  return checkRunEnd(nextState, now);
}

export function useManualAction(state: GameState, actionId: string, now: number): GameState {
  if (state.completed || state.lost) return state;

  const action = state.manualActions.find((candidate) => candidate.id === actionId);
  if (!action) return state;
  if (
    action.id === "coffee-break" &&
    !state.locations.some((location) => location.id === "coffee-machine" && location.owned)
  ) {
    return appendLog(state, "Machine à café requise pour Pause café.");
  }
  if (action.lastUsedAt !== null && now - action.lastUsedAt < action.cooldownMs) {
    return state;
  }

  const cost = getManualActionCost(action);
  if (!canAffordResources(state.resources, cost)) {
    const missingResource = firstMissingResource(state.resources, cost);
    return appendLog(
      state,
      `Pas assez ${missingResource ? getResourceName(missingResource) : "de ressources"} pour ${action.name}. Le process vide ses poches.`,
    );
  }

  let nextState: GameState = {
    ...state,
    manualActions: state.manualActions.map((candidate) =>
      candidate.id === actionId ? { ...candidate, lastUsedAt: now } : candidate,
    ),
    manualActionUseCounts: {
      ...state.manualActionUseCounts,
      [actionId]: (state.manualActionUseCounts[actionId] ?? 0) + 1,
    },
  };
  nextState = payResourceCost(nextState, cost);
  nextState = applyResourceDelta(nextState, action.effect);
  nextState = appendLog(nextState, `Action lancée : ${action.name}. Le bureau fait semblant de garder son calme.`);
  nextState = updateMilestones(nextState);
  nextState = updateMissions(nextState, now);
  return checkRunEnd(nextState, now);
}

export function checkLoss(state: GameState, lostAt = state.lastTickAt): GameState {
  if (state.completed || state.lost) return state;
  if (state.resources.ambiance > 0 && state.resources.chaos < 100) return state;

  const message =
    state.resources.ambiance <= 0
      ? "Partie perdue. L’ambiance est à zéro : l’open-space vient de déposer un préavis collectif."
      : "Partie perdue. Chaos à 100 % : réunion de crise, badges bloqués, café en arrêt technique.";

  return appendLog(
    {
      ...state,
      lost: true,
      lostAt,
    },
    message,
  );
}

export function checkRunEnd(state: GameState, endedAt = state.lastTickAt): GameState {
  return checkCompletion(checkLoss(state, endedAt), endedAt);
}

export function checkCompletion(state: GameState, completedAt = state.lastTickAt): GameState {
  if (state.completed || state.lost) return state;
  const autonomousOffice = state.locations.find((location) => location.id === "autonomous-office");
  const autopilot = state.synergies.find((synergy) => synergy.id === "office-autopilot");
  const completed =
    state.resources.reputation >= 1_000_000 && autonomousOffice?.owned && autopilot?.discovered;

  return completed
    ? appendLog(
        { ...state, completed: true, completedAt },
        "Office Village complet. Le comité de pilotage applaudit sans ouvrir le micro.",
      )
    : state;
}

export function continueInSandbox(state: GameState): GameState {
  return {
    ...state,
    sandboxMode: true,
  };
}
