import { clampResources, createInitialGameState, updateMissions } from "@/lib/incrementalGame";
import type { GameState, Resources } from "@/types/incremental";

export const SAVE_KEY = "office-village-incremental-save-v1";
const RETIRED_MANUAL_ACTION_LABELS = ["Sprint équipe"];

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
  const log = saved.log.filter(
    (entry) => !RETIRED_MANUAL_ACTION_LABELS.some((label) => entry.includes(label)),
  );

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
    activeMission: saved.activeMission ?? base.activeMission,
    completedMissionIds: saved.completedMissionIds ?? [],
    activeBoosts: saved.activeBoosts ?? [],
    lastMissionTemplateId: saved.lastMissionTemplateId,
    activeIncident: saved.activeIncident,
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
