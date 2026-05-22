import type { GameAssetId } from "@/lib/gameAssets";
import type { Mission, Resources } from "@/types/incremental";

export const WORKER_ASSET_IDS: Record<string, GameAssetId> = {
  intern: "worker-intern",
  "tired-dev": "worker-tired-dev",
  designer: "worker-designer",
  manager: "worker-manager",
  "senior-dev": "worker-senior-dev",
  sales: "worker-sales",
  hr: "worker-hr",
  "office-manager": "worker-office-manager",
  "ai-agent": "worker-ai-agent",
};

export const LOCATION_ASSET_IDS: Record<string, GameAssetId> = {
  "starting-office": "location-starting-office",
  "coffee-machine": "location-coffee-machine",
  "open-space": "location-open-space",
  "project-room": "location-project-room",
  "relax-corner": "location-relax-corner",
  "meeting-room": "location-meeting-room",
  "creative-studio": "location-creative-studio",
  "client-desk": "location-client-desk",
  "autonomous-office": "location-autonomous-office",
};

export const RESOURCE_ASSET_IDS: Record<keyof Resources, GameAssetId> = {
  ideas: "resource-ideas",
  budget: "resource-budget",
  ambiance: "resource-ambiance",
  reputation: "resource-reputation",
  chaos: "resource-chaos",
};

export const ACTION_ASSET_IDS: Record<string, GameAssetId> = {
  brainstorm: "resource-ideas",
  "coffee-break": "location-coffee-machine",
  "client-pitch": "location-meeting-room",
};

export const SKILL_ASSET_IDS: Record<string, GameAssetId> = {
  organization: "worker-office-manager",
  "efficient-meetings": "location-meeting-room",
  "postit-empire": "location-project-room",
  "green-plants": "resource-talent",
  "coffee-culture": "location-coffee-machine",
  "team-culture": "worker-hr",
  "pitch-deck": "location-project-room",
  "clear-offer": "resource-budget",
  "scale-up": "badge-starburst",
};

export const SYNERGY_ASSET_IDS: Record<string, GameAssetId> = {
  "caffeinated-dev": "location-coffee-machine",
  "junior-team": "worker-intern",
  "permanent-brainstorm": "resource-ideas",
  "calm-team": "worker-hr",
  "business-pipeline": "worker-sales",
  "office-autopilot": "worker-ai-agent",
};

export const MILESTONE_ASSET_IDS: Record<string, GameAssetId> = {
  "ten-interns": "worker-intern",
  "first-office": "location-open-space",
  "happy-office": "resource-ambiance",
  "one-million-ideas": "resource-ideas",
  "synergy-master": "badge-gem",
};

export const INCIDENT_ASSET_IDS: Record<string, GameAssetId> = {
  "coffee-noise": "location-coffee-machine",
  "wild-meeting": "location-meeting-room",
  "intern-blockchain": "worker-intern",
  "microwave-fish": "resource-chaos",
  "postit-wall": "location-project-room",
  "designer-redesign": "worker-designer",
  "sales-fake-feature": "worker-sales",
  "demo-bug": "badge-starburst",
  "slack-fire": "resource-chaos",
  "ai-too-motivated": "worker-ai-agent",
};

export function getWorkerAssetId(workerId: string): GameAssetId {
  return WORKER_ASSET_IDS[workerId] ?? "worker-intern";
}

export function getLocationAssetId(locationId: string): GameAssetId {
  return LOCATION_ASSET_IDS[locationId] ?? "location-starting-office";
}

export function getActionAssetId(actionId: string): GameAssetId {
  return ACTION_ASSET_IDS[actionId] ?? "icon-sparkle";
}

export function getSkillAssetId(skillId: string): GameAssetId {
  return SKILL_ASSET_IDS[skillId] ?? "resource-talent";
}

export function getSynergyAssetId(synergyId: string): GameAssetId {
  return SYNERGY_ASSET_IDS[synergyId] ?? "badge-gem";
}

export function getMilestoneAssetId(milestoneId: string): GameAssetId {
  return MILESTONE_ASSET_IDS[milestoneId] ?? "badge-medal";
}

export function getIncidentAssetId(incidentId: string): GameAssetId {
  return INCIDENT_ASSET_IDS[incidentId] ?? "resource-chaos";
}

export function getMissionAssetId(mission: Mission): GameAssetId {
  const { requirement } = mission;

  if (requirement.kind === "workerCount") return getWorkerAssetId(requirement.workerId);
  if (requirement.kind === "locationOwned") return getLocationAssetId(requirement.locationId);
  if (requirement.kind === "skillUnlocked") return getSkillAssetId(requirement.skillId);
  if (requirement.kind === "manualActionUses") return getActionAssetId(requirement.actionId);
  if (requirement.kind === "resourceAtLeast") return RESOURCE_ASSET_IDS[requirement.resource];
  if (requirement.kind === "ambianceAtLeast") return "resource-ambiance";
  if (requirement.kind === "synergiesDiscovered") return "badge-gem";

  return "icon-sparkle";
}
