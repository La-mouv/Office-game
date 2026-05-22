import type { GameState, Mission, MissionRequirement } from "@/types/incremental";

export const GUIDED_MISSIONS: Mission[] = [
  {
    id: "guided-first-intern",
    templateId: "guided-first-intern",
    kind: "guided",
    title: "Première recrue",
    description: "Recrute une première paire de mains avant que le planning parte en comité de crise.",
    emoji: "🧢",
    requirement: { kind: "workerCount", workerId: "intern", count: 1 },
    reward: { resources: { budget: 10 } },
  },
  {
    id: "guided-first-ideas",
    templateId: "guided-first-ideas",
    kind: "guided",
    title: "Un peu de matière grise",
    description: "Accumule 25 idées. Le mur de post-its réclame sa ration quotidienne.",
    emoji: "💡",
    requirement: { kind: "resourceAtLeast", resource: "ideas", amount: 25 },
    reward: { resources: { budget: 10 } },
  },
  {
    id: "guided-first-pitch",
    templateId: "guided-first-pitch",
    kind: "guided",
    title: "Le premier pitch",
    description: "Transforme une idée correcte en conversation client presque crédible.",
    emoji: "🤝",
    requirement: { kind: "manualActionUses", actionId: "client-pitch", count: 1 },
    reward: {
      resources: { budget: 20, reputation: 10 },
      boost: {
        id: "pitch-spark",
        name: "Élan du premier pitch",
        description: "+25 % idées",
        effect: { ideasMultiplier: 0.25 },
        durationMs: 20_000,
      },
    },
  },
  {
    id: "guided-coffee-machine",
    templateId: "guided-coffee-machine",
    kind: "guided",
    title: "Café diplomatique",
    description: "Construis la Machine à café. Sans elle, le bureau négocie avec le vide.",
    emoji: "☕",
    requirement: { kind: "locationOwned", locationId: "coffee-machine" },
    reward: { resources: { ambiance: 5, reputation: 10 } },
  },
  {
    id: "guided-first-skill",
    templateId: "guided-first-skill",
    kind: "guided",
    title: "Une vraie méthode",
    description: "Achète Organisation. Le chaos déteste quand quelqu’un retrouve le bon dossier.",
    emoji: "📋",
    requirement: { kind: "skillUnlocked", skillId: "organization" },
    reward: {
      resources: { budget: 40 },
      boost: {
        id: "organized-desk",
        name: "Bureau rangé",
        description: "+15 % global",
        effect: { globalMultiplier: 0.15 },
        durationMs: 20_000,
      },
    },
  },
];

function cloneMission(mission: Mission): Mission {
  return structuredClone(mission);
}

export function missionRequirementMet(state: GameState, mission: Mission): boolean {
  const { requirement } = mission;

  if (requirement.kind === "workerCount") {
    return (
      (state.workers.find((worker) => worker.id === requirement.workerId)?.count ?? 0) >=
      requirement.count
    );
  }
  if (requirement.kind === "resourceAtLeast") {
    return state.resources[requirement.resource] >= requirement.amount;
  }
  if (requirement.kind === "manualActionUses") {
    return (state.manualActionUseCounts[requirement.actionId] ?? 0) >= requirement.count;
  }
  if (requirement.kind === "locationOwned") {
    return Boolean(state.locations.find((location) => location.id === requirement.locationId)?.owned);
  }
  if (requirement.kind === "skillUnlocked") {
    return Boolean(state.skills.find((skill) => skill.id === requirement.skillId)?.unlocked);
  }
  if (requirement.kind === "ambianceAtLeast") {
    return state.resources.ambiance >= requirement.amount;
  }
  return state.synergies.filter((synergy) => synergy.discovered).length >= requirement.count;
}

function getNextGuidedMission(state: GameState): Mission | null {
  const mission = GUIDED_MISSIONS.find(
    (candidate) => !state.completedMissionIds.includes(candidate.id),
  );
  return mission ? cloneMission(mission) : null;
}

function createBrainstormBurst(state: GameState): Mission {
  return {
    id: "dynamic-brainstorm-burst",
    templateId: "brainstorm-burst",
    kind: "dynamic",
    title: "Pluie de post-its",
    description: "Lance 3 brainstorms. Le tableau blanc veut souffrir utilement.",
    emoji: "💡",
    requirement: {
      kind: "manualActionUses",
      actionId: "brainstorm",
      count: (state.manualActionUseCounts.brainstorm ?? 0) + 3,
    },
    reward: {
      resources: { ideas: 40 },
      boost: {
        id: "brainstorm-rush",
        name: "Mur de post-its",
        description: "+25 % idées",
        effect: { ideasMultiplier: 0.25 },
        durationMs: 20_000,
      },
    },
  };
}

function createPitchRound(state: GameState): Mission {
  return {
    id: "dynamic-pitch-round",
    templateId: "pitch-round",
    kind: "dynamic",
    title: "Petite tournée commerciale",
    description: "Fais 2 Pitchs client. Les feutres ne vont pas se financer seuls.",
    emoji: "🤝",
    requirement: {
      kind: "manualActionUses",
      actionId: "client-pitch",
      count: (state.manualActionUseCounts["client-pitch"] ?? 0) + 2,
    },
    reward: {
      resources: { budget: 50, reputation: 10 },
      boost: {
        id: "good-quarter",
        name: "Bon trimestre",
        description: "+25 % budget",
        effect: { budgetMultiplier: 0.25 },
        durationMs: 20_000,
      },
    },
  };
}

function createHireTeam(state: GameState): Mission | null {
  const worker = state.workers.find(
    (candidate) =>
      candidate.unlockReputation <= state.resources.reputation && candidate.level < 5,
  );
  if (!worker) return null;

  return {
    id: `dynamic-hire-${worker.id}`,
    templateId: "hire-team",
    kind: "dynamic",
    title: "Renfort demandé",
    description: `Recrute 2 ${worker.name.toLowerCase()} supplémentaires avant que le planning fasse semblant d’aller bien.`,
    emoji: worker.emoji,
    requirement: {
      kind: "workerCount",
      workerId: worker.id,
      count: worker.count + 2,
    },
    reward: {
      resources: { budget: 35 },
      boost: {
        id: "fresh-recruits",
        name: "Nouvelle énergie",
        description: "+15 % idées",
        effect: { ideasMultiplier: 0.15 },
        durationMs: 20_000,
      },
    },
  };
}

function createBuildNextRoom(state: GameState): Mission | null {
  const location = state.locations.find(
    (candidate) =>
      !candidate.owned && candidate.unlockReputation <= state.resources.reputation,
  );
  if (!location) return null;

  return {
    id: `dynamic-build-${location.id}`,
    templateId: "build-next-room",
    kind: "dynamic",
    title: "Le bureau pousse",
    description: `Construis ${location.name}. Même les murs veulent une promotion.`,
    emoji: location.emoji,
    requirement: {
      kind: "locationOwned",
      locationId: location.id,
    },
    reward: { resources: { ideas: 25, budget: 30 } },
  };
}

function createFreshAir(state: GameState): Mission | null {
  if (state.resources.ambiance >= 90) return null;
  return {
    id: "dynamic-fresh-air",
    templateId: "fresh-air",
    kind: "dynamic",
    title: "Air respirable",
    description: "Fais monter l’ambiance. Les plantes commencent à lire les mails RH.",
    emoji: "😊",
    requirement: {
      kind: "ambianceAtLeast",
      amount: Math.min(90, Math.max(70, Math.ceil(state.resources.ambiance + 10))),
    },
    reward: {
      resources: { reputation: 15 },
      boost: {
        id: "good-vibes",
        name: "Bonne onde",
        description: "+20 % réputation",
        effect: { reputationMultiplier: 0.2 },
        durationMs: 20_000,
      },
    },
  };
}

function createUnlockSkill(state: GameState): Mission | null {
  const skill = state.skills.find(
    (candidate) =>
      !candidate.unlocked &&
      candidate.unlockReputation <= state.resources.reputation &&
      candidate.cost <= state.talentPoints,
  );
  if (!skill) return null;

  return {
    id: `dynamic-skill-${skill.id}`,
    templateId: "unlock-skill",
    kind: "dynamic",
    title: "La bonne habitude",
    description: `Achète ${skill.name}. Le talent attend devant la salle de réunion.`,
    emoji: skill.emoji,
    requirement: {
      kind: "skillUnlocked",
      skillId: skill.id,
    },
    reward: {
      resources: { budget: 40 },
      boost: {
        id: "skill-momentum",
        name: "Équipe affûtée",
        description: "+15 % global",
        effect: { globalMultiplier: 0.15 },
        durationMs: 20_000,
      },
    },
  };
}

function synergyCanBePursued(state: GameState): boolean {
  return state.synergies.some((synergy) => {
    if (synergy.discovered) return false;
    const workersUnlocked = Object.keys(synergy.requirements.workers ?? {}).every((workerId) => {
      const worker = state.workers.find((candidate) => candidate.id === workerId);
      return Boolean(worker && worker.unlockReputation <= state.resources.reputation);
    });
    const locationsUnlocked = (synergy.requirements.locations ?? []).every((locationId) => {
      const location = state.locations.find((candidate) => candidate.id === locationId);
      return Boolean(location && location.unlockReputation <= state.resources.reputation);
    });
    return workersUnlocked && locationsUnlocked;
  });
}

function createFindSynergy(state: GameState): Mission | null {
  if (!synergyCanBePursued(state)) return null;
  return {
    id: "dynamic-find-synergy",
    templateId: "find-synergy",
    kind: "dynamic",
    title: "Éclair de génie collectif",
    description: "Découvre un nouveau combo. Le bureau adore quand le chaos devient rentable.",
    emoji: "🔗",
    requirement: {
      kind: "synergiesDiscovered",
      count: state.synergies.filter((synergy) => synergy.discovered).length + 1,
    },
    reward: {
      resources: { ideas: 40, reputation: 25 },
      boost: {
        id: "team-flow",
        name: "Flow d’équipe",
        description: "+15 % global",
        effect: { globalMultiplier: 0.15 },
        durationMs: 20_000,
      },
    },
  };
}

export function getEligibleDynamicMissions(state: GameState): Mission[] {
  return [
    createBrainstormBurst(state),
    createPitchRound(state),
    createHireTeam(state),
    createBuildNextRoom(state),
    createFreshAir(state),
    createUnlockSkill(state),
    createFindSynergy(state),
  ].filter((mission): mission is Mission => mission !== null);
}

function withUniqueDynamicId(state: GameState, mission: Mission): Mission {
  return {
    ...mission,
    id: `${mission.id}-${state.completedMissionIds.length + 1}`,
  };
}

export function createNextMission(
  state: GameState,
  rng: () => number = Math.random,
): Mission | null {
  const guided = getNextGuidedMission(state);
  if (guided) return guided;

  const eligible = getEligibleDynamicMissions(state);
  if (eligible.length === 0) return null;

  const withoutRepeat = eligible.filter(
    (mission) => mission.templateId !== state.lastMissionTemplateId,
  );
  const pool = withoutRepeat.length > 0 ? withoutRepeat : eligible;
  const index = Math.min(Math.floor(rng() * pool.length), pool.length - 1);
  return withUniqueDynamicId(state, pool[index] as Mission);
}

export function getMissionProgress(
  state: GameState,
  requirement: MissionRequirement,
): { current: number; target: number } {
  if (requirement.kind === "workerCount") {
    return {
      current: state.workers.find((worker) => worker.id === requirement.workerId)?.count ?? 0,
      target: requirement.count,
    };
  }
  if (requirement.kind === "resourceAtLeast") {
    return { current: state.resources[requirement.resource], target: requirement.amount };
  }
  if (requirement.kind === "manualActionUses") {
    return { current: state.manualActionUseCounts[requirement.actionId] ?? 0, target: requirement.count };
  }
  if (requirement.kind === "ambianceAtLeast") {
    return { current: state.resources.ambiance, target: requirement.amount };
  }
  if (requirement.kind === "synergiesDiscovered") {
    return {
      current: state.synergies.filter((synergy) => synergy.discovered).length,
      target: requirement.count,
    };
  }
  return {
    current: missionRequirementMet(state, {
      id: "progress-check",
      templateId: "progress-check",
      kind: "dynamic",
      title: "",
      description: "",
      emoji: "",
      requirement,
      reward: {},
    })
      ? 1
      : 0,
    target: 1,
  };
}
