import type { GameState, Milestone, Synergy } from "@/types/incremental";

export type AchievementBadge = {
  id: string;
  kind: "combo" | "palier";
  name: string;
  description: string;
  effect: Synergy["effect"] | Milestone["reward"];
  unlocked: boolean;
  emoji: string;
  requirement?: string;
};

function synergyRequirementText(state: GameState, synergy: Synergy): string {
  const workerRequirements = Object.entries(synergy.requirements.workers ?? {}).map(
    ([workerId, count]) => {
      const worker = state.workers.find((candidate) => candidate.id === workerId);
      return `${count} × ${worker?.name ?? workerId}`;
    },
  );
  const locationRequirements = (synergy.requirements.locations ?? []).map((locationId) => {
    const location = state.locations.find((candidate) => candidate.id === locationId);
    return location?.name ?? locationId;
  });

  return [...workerRequirements, ...locationRequirements].join(" + ");
}

export function getAchievementBadges(state: GameState): AchievementBadge[] {
  const comboBadges = state.synergies.map((synergy) => ({
    id: synergy.id,
    kind: "combo" as const,
    name: synergy.name,
    description: synergy.description,
    effect: synergy.effect,
    unlocked: synergy.discovered,
    emoji: synergy.emoji,
    requirement: synergyRequirementText(state, synergy),
  }));

  const palierBadges = state.milestones.map((milestone) => ({
    id: milestone.id,
    kind: "palier" as const,
    name: milestone.title,
    description: milestone.description,
    effect: milestone.reward,
    unlocked: milestone.achieved,
    emoji: milestone.emoji,
  }));

  return [...comboBadges, ...palierBadges];
}

export function getUnlockedAchievementBadges(state: GameState): AchievementBadge[] {
  return getAchievementBadges(state).filter((badge) => badge.unlocked);
}
