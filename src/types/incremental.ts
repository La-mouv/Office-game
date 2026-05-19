export type Resources = {
  ideas: number;
  budget: number;
  ambiance: number;
  reputation: number;
  chaos: number;
};

export type Worker = {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  count: number;
  level: number;
  baseProduction: Partial<Resources>;
  unlockReputation: number;
  emoji: string;
  tags: string[];
};

export type OfficeLocation = {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  owned: boolean;
  level: number;
  maxLevel: number;
  effect: {
    ideasMultiplier?: number;
    budgetMultiplier?: number;
    reputationMultiplier?: number;
    globalMultiplier?: number;
    ambianceBonus?: number;
    chaosPerSecond?: number;
    chaosReduction?: number;
  };
  unlockReputation: number;
  emoji: string;
  tags: string[];
};

export type Synergy = {
  id: string;
  name: string;
  description: string;
  requirements: {
    workers?: Record<string, number>;
    locations?: string[];
  };
  effect: {
    ideasMultiplier?: number;
    budgetMultiplier?: number;
    reputationMultiplier?: number;
    globalMultiplier?: number;
    ambianceBonus?: number;
    chaosReduction?: number;
  };
  discovered: boolean;
  emoji: string;
};

export type IncidentChoice = {
  id: string;
  label: string;
  description?: string;
  effect: Partial<Resources>;
  chance?: {
    successRate: number;
    successEffect: Partial<Resources>;
    failEffect: Partial<Resources>;
  };
};

export type Incident = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  minChaos?: number;
  maxChaos?: number;
  choices: IncidentChoice[];
};

export type Skill = {
  id: string;
  name: string;
  branch: "productivity" | "comfort" | "business";
  description: string;
  cost: number;
  unlockReputation: number;
  effect: {
    ideasMultiplier?: number;
    budgetMultiplier?: number;
    reputationMultiplier?: number;
    globalMultiplier?: number;
    ambianceBonus?: number;
    minAmbiance?: number;
    chaosReduction?: number;
  };
  unlocked: boolean;
  emoji: string;
};

export type Milestone = {
  id: string;
  title: string;
  description: string;
  condition: {
    workerCount?: { workerId: string; count: number };
    locationOwned?: string;
    totalIdeas?: number;
    totalBudget?: number;
    reputation?: number;
    ambiance?: number;
    synergiesCount?: number;
  };
  reward: {
    ideasMultiplier?: number;
    budgetMultiplier?: number;
    reputationMultiplier?: number;
    globalMultiplier?: number;
    resources?: Partial<Resources>;
  };
  achieved: boolean;
  emoji: string;
};

export type ManualAction = {
  id: string;
  name: string;
  description: string;
  cooldownMs: number;
  lastUsedAt: number | null;
  cost?: Partial<Resources>;
  effect: Partial<Resources>;
  emoji: string;
};

export type MissionRequirement =
  | { kind: "workerCount"; workerId: string; count: number }
  | { kind: "resourceAtLeast"; resource: keyof Resources; amount: number }
  | { kind: "manualActionUses"; actionId: string; count: number }
  | { kind: "locationOwned"; locationId: string }
  | { kind: "skillUnlocked"; skillId: string }
  | { kind: "ambianceAtLeast"; amount: number }
  | { kind: "synergiesDiscovered"; count: number };

export type ActiveBoost = {
  id: string;
  name: string;
  description: string;
  effect: {
    ideasMultiplier?: number;
    budgetMultiplier?: number;
    reputationMultiplier?: number;
    globalMultiplier?: number;
  };
  expiresAt: number;
};

export type MissionReward = {
  resources?: Partial<Resources>;
  boost?: Omit<ActiveBoost, "expiresAt"> & {
    durationMs: number;
  };
};

export type Mission = {
  id: string;
  templateId: string;
  kind: "guided" | "dynamic";
  title: string;
  description: string;
  emoji: string;
  requirement: MissionRequirement;
  reward: MissionReward;
};

export type ProductionSummary = {
  perSecond: Partial<Resources>;
  multipliers: {
    ambiance: number;
    chaos: number;
    ideas: number;
    budget: number;
    reputation: number;
    global: number;
  };
  activeSynergyIds: string[];
  activeSkillIds: string[];
};

export type GameState = {
  resources: Resources;
  workers: Worker[];
  locations: OfficeLocation[];
  synergies: Synergy[];
  skills: Skill[];
  milestones: Milestone[];
  manualActions: ManualAction[];
  manualActionUseCounts: Record<string, number>;
  activeMission: Mission | null;
  completedMissionIds: string[];
  activeBoosts: ActiveBoost[];
  lastMissionTemplateId?: string;
  activeIncident: Incident | null;
  lastIncidentAt: number;
  startedAt: number;
  lastTickAt: number;
  totalIdeasEarned: number;
  totalBudgetEarned: number;
  totalReputationEarned: number;
  talentPoints: number;
  highestRewardedReputationLevel: number;
  completed: boolean;
  sandboxMode: boolean;
  log: string[];
};
