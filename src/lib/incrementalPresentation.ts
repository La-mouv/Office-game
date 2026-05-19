import { getLocationCost, getWorkerCost } from "@/lib/incrementalGame";
import { RESOURCE_LABELS, formatNumber } from "@/lib/incrementalUi";
import type { GameState, OfficeLocation, Resources, Worker } from "@/types/incremental";

export type CardEmphasis = "strong" | "standard" | "quiet";
export type GainBubble = {
  id: string;
  label: string;
};
export type SceneReaction = "ambiance" | "chaos" | null;
export type MissionTodoItem = {
  id: string;
  title: string;
  completed: boolean;
};

export function classifyWorkerCard(
  worker: Worker,
  reputation: number,
  budget: number,
): CardEmphasis {
  if (reputation < worker.unlockReputation) return "quiet";
  return budget >= getWorkerCost(worker) ? "strong" : "standard";
}

export function classifyLocationCard(
  location: OfficeLocation,
  reputation: number,
  budget: number,
): CardEmphasis {
  if (reputation < location.unlockReputation) return "quiet";
  return budget >= getLocationCost(location) ? "strong" : "standard";
}

export function diffResources(before: Resources, after: Resources): Partial<Resources> {
  return (Object.keys(after) as (keyof Resources)[]).reduce<Partial<Resources>>(
    (gains, resource) => {
      const delta = after[resource] - before[resource];
      if (delta > 0) gains[resource] = delta;
      return gains;
    },
    {},
  );
}

export function buildGainBubbleLabels(gains: Partial<Resources>): string[] {
  return (Object.entries(gains) as [keyof Resources, number][])
    .filter(([, amount]) => amount > 0)
    .map(
      ([resource, amount]) =>
        `+${formatNumber(amount)} ${RESOURCE_LABELS[resource].toLowerCase()}`,
    );
}

export function getSceneReaction(before: Resources, after: Resources): SceneReaction {
  if (after.chaos > before.chaos) return "chaos";
  if (after.ambiance > before.ambiance) return "ambiance";
  return null;
}

export function getRecentLogEntries(entries: string[], limit = 4): string[] {
  return entries.slice(-limit);
}

export function buildMissionTodoItems(state: GameState): MissionTodoItem[] {
  const completed = state.log
    .map((entry, index): MissionTodoItem | null => {
      const match = entry.match(/^Mission accomplie : (.+)\.$/);
      if (!match) return null;

      return {
        id: `completed-${index}`,
        title: match[1],
        completed: true,
      };
    })
    .filter((item): item is MissionTodoItem => item !== null);

  if (!state.activeMission) return completed;

  return [
    ...completed,
    {
      id: state.activeMission.id,
      title: state.activeMission.title,
      completed: false,
    },
  ];
}
