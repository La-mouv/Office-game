import { clampResources, createInitialGameState, updateMissions } from "@/lib/incrementalGame";
import { INCIDENTS } from "@/lib/incrementalData";
import type { GameState, Incident, Mission, Resources, Skill } from "@/types/incremental";

export const SAVE_KEY = "office-village-incremental-save-v1";
const RETIRED_MANUAL_ACTION_LABELS = ["Sprint équipe"];

function refreshMissionCopy(
  mission: Mission,
  skills: Skill[],
): Mission {
  if (mission.templateId === "guided-first-intern") {
    return {
      ...mission,
      description: "Recrute une première paire de mains avant que le planning parte en comité de crise.",
    };
  }

  if (mission.templateId === "guided-first-ideas") {
    return {
      ...mission,
      description: "Accumule 25 idées. Le mur de post-its réclame sa ration quotidienne.",
    };
  }

  if (mission.templateId === "guided-first-pitch") {
    return {
      ...mission,
      description: "Transforme une idée correcte en conversation client presque crédible.",
    };
  }

  if (mission.templateId === "guided-coffee-machine") {
    return {
      ...mission,
      description: "Construis la Machine à café. Sans elle, le bureau négocie avec le vide.",
    };
  }

  if (mission.templateId === "guided-first-skill") {
    return {
      ...mission,
      description: "Achète Organisation. Le chaos déteste quand quelqu’un retrouve le bon dossier.",
    };
  }

  if (mission.templateId === "brainstorm-burst") {
    return {
      ...mission,
      description: "Lance 3 brainstorms. Le tableau blanc veut souffrir utilement.",
    };
  }

  if (mission.templateId === "pitch-round") {
    return {
      ...mission,
      description: "Fais 2 Pitchs client. Les feutres ne vont pas se financer seuls.",
    };
  }

  const requirement = mission.requirement;
  if (mission.templateId === "hire-team" && requirement.kind === "workerCount") {
    return {
      ...mission,
      description:
        mission.description.replace(
          /Recrute 2 (.+?) supplémentaires\.?$/,
          "Recrute 2 $1 supplémentaires avant que le planning fasse semblant d’aller bien.",
        ),
    };
  }

  if (mission.templateId === "build-next-room") {
    return {
      ...mission,
      description:
        mission.description.replace(
          /Construis (.+?)\. Les murs veulent aussi leur carrière\./,
          "Construis $1. Même les murs veulent une promotion.",
        ),
    };
  }

  if (mission.templateId === "fresh-air") {
    return {
      ...mission,
      description: "Fais monter l’ambiance. Les plantes commencent à lire les mails RH.",
    };
  }

  if (mission.templateId === "unlock-skill" && requirement.kind === "skillUnlocked") {
    const skill = skills.find((candidate) => candidate.id === requirement.skillId);
    return {
      ...mission,
      description: `Achète ${skill?.name ?? "ce talent"}. Le talent attend devant la salle de réunion.`,
    };
  }

  if (mission.templateId === "find-synergy") {
    return {
      ...mission,
      description: "Découvre un nouveau combo. Le bureau adore quand le chaos devient rentable.",
    };
  }

  return mission;
}

function refreshLogCopy(entry: string): string {
  return entry
    .replace(
      "Bienvenue dans Office Village. Le bureau respire, les idées commencent.",
      "Bienvenue dans Office Village. L’open-space respire encore, le chaos demande déjà un badge.",
    )
    .replace("Synergie découverte", "Combo découvert")
    .replace("Mission accomplie", "Mission pliée")
    .replace("Milestone atteint", "Palier validé")
    .replace("Skill débloqué", "Talent signé");
}

function refreshIncidentCopy(incident: Incident): Incident {
  const latestIncident = INCIDENTS.find((candidate) => candidate.id === incident.id);
  return latestIncident
    ? {
        ...incident,
        title: latestIncident.title,
        description: latestIncident.description,
      }
    : incident;
}

function hasNumericResources(value: unknown): value is Resources {
  if (!value || typeof value !== "object") return false;
  const resources = value as Record<string, unknown>;
  return ["ideas", "budget", "ambiance", "reputation", "chaos"].every(
    (key) => typeof resources[key] === "number",
  );
}

export function parseSavedGame(raw: string): GameState | null {
  try {
    const parsed = JSON.parse(raw) as Partial<GameState>;
    const isValid =
      hasNumericResources(parsed.resources) &&
      Array.isArray(parsed.workers) &&
      Array.isArray(parsed.locations) &&
      Array.isArray(parsed.synergies) &&
      Array.isArray(parsed.skills) &&
      Array.isArray(parsed.milestones) &&
      Array.isArray(parsed.manualActions) &&
      typeof parsed.lastIncidentAt === "number" &&
      typeof parsed.startedAt === "number" &&
      typeof parsed.lastTickAt === "number" &&
      typeof parsed.totalIdeasEarned === "number" &&
      typeof parsed.totalBudgetEarned === "number" &&
      typeof parsed.totalReputationEarned === "number" &&
      typeof parsed.talentPoints === "number" &&
      typeof parsed.highestRewardedReputationLevel === "number" &&
      typeof parsed.completed === "boolean" &&
      typeof parsed.sandboxMode === "boolean" &&
      Array.isArray(parsed.log);

    return isValid ? (parsed as GameState) : null;
  } catch {
    return null;
  }
}

export function rehydrateSavedGame(saved: GameState): GameState {
  const base = createInitialGameState(saved.startedAt);
  const savedWorkers = new Map(saved.workers.map((worker) => [worker.id, worker]));
  const savedLocations = new Map(saved.locations.map((location) => [location.id, location]));
  const savedSynergies = new Map(saved.synergies.map((synergy) => [synergy.id, synergy]));
  const savedSkills = new Map(saved.skills.map((skill) => [skill.id, skill]));
  const savedMilestones = new Map(saved.milestones.map((milestone) => [milestone.id, milestone]));
  const savedActions = new Map(saved.manualActions.map((action) => [action.id, action]));
  const activeManualActionIds = new Set(base.manualActions.map((action) => action.id));

  const workers = base.workers.map((worker) => {
    const savedWorker = savedWorkers.get(worker.id);
    return savedWorker
      ? {
          ...worker,
          count: savedWorker.count,
          level: Math.min(5, Math.max(1, savedWorker.level)),
        }
      : worker;
  });

  const locations = base.locations.map((location) => {
    const savedLocation = savedLocations.get(location.id);
    return savedLocation
      ? {
          ...location,
          owned: savedLocation.owned,
          level: Math.min(location.maxLevel, Math.max(1, savedLocation.level)),
        }
      : location;
  });

  const synergies = base.synergies.map((synergy) => ({
    ...synergy,
    discovered: savedSynergies.get(synergy.id)?.discovered ?? synergy.discovered,
  }));
  const skills = base.skills.map((skill) => ({
    ...skill,
    unlocked: savedSkills.get(skill.id)?.unlocked ?? skill.unlocked,
  }));
  const milestones = base.milestones.map((milestone) => ({
    ...milestone,
    achieved: savedMilestones.get(milestone.id)?.achieved ?? milestone.achieved,
  }));
  const manualActions = base.manualActions.map((action) => ({
    ...action,
    lastUsedAt: savedActions.get(action.id)?.lastUsedAt ?? action.lastUsedAt,
  }));
  const savedManualActionUseCounts =
    saved.manualActionUseCounts ??
    Object.fromEntries(
      saved.manualActions
        .filter((action) => action.lastUsedAt !== null)
        .map((action) => [action.id, 1]),
    );
  const manualActionUseCounts = Object.fromEntries(
    Object.entries(savedManualActionUseCounts).filter(([actionId]) =>
      activeManualActionIds.has(actionId),
    ),
  );
  const log = saved.log
    .filter((entry) => !RETIRED_MANUAL_ACTION_LABELS.some((label) => entry.includes(label)))
    .map(refreshLogCopy);
  const activeMission = saved.activeMission
    ? refreshMissionCopy(saved.activeMission, skills)
    : base.activeMission;

  const rehydratedState: GameState = {
    ...base,
    resources: clampResources(saved.resources, skills),
    workers,
    locations,
    synergies,
    skills,
    milestones,
    manualActions,
    manualActionUseCounts,
    activeMission,
    completedMissionIds: saved.completedMissionIds ?? [],
    activeBoosts: saved.activeBoosts ?? [],
    lastMissionTemplateId: saved.lastMissionTemplateId,
    activeIncident: saved.activeIncident ? refreshIncidentCopy(saved.activeIncident) : null,
    lastIncidentAt: saved.lastIncidentAt,
    startedAt: saved.startedAt,
    lastTickAt: saved.lastTickAt,
    totalIdeasEarned: saved.totalIdeasEarned,
    totalBudgetEarned: saved.totalBudgetEarned,
    totalReputationEarned: saved.totalReputationEarned,
    talentPoints: saved.talentPoints,
    highestRewardedReputationLevel: saved.highestRewardedReputationLevel,
    completed: saved.completed,
    sandboxMode: saved.sandboxMode,
    log,
  };

  return updateMissions(rehydratedState, Date.now(), () => 0);
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
    const parsed = parseSavedGame(raw);
    return parsed ? rehydrateSavedGame(parsed) : null;
  } catch {
    return null;
  }
}
