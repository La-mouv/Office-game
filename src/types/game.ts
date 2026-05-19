export type Resources = {
  ideas: number;
  energy: number;
  budget: number;
  happiness: number;
  reputation: number;
  stress: number;
  postIts: number;
  talentPoints: number;
};

export type CardType =
  | "person"
  | "building"
  | "object"
  | "action"
  | "event"
  | "project"
  | "resource";

export type CardRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type GameCard = {
  id: string;
  name: string;
  type: CardType;
  rarity: CardRarity;
  level: number;
  maxLevel?: number;
  cost?: Partial<Resources>;
  production?: Partial<Resources>;
  instantEffect?: Partial<Resources>;
  description: string;
  tags: string[];
  capacity?: number;
  connectionsMax?: number;
  requirements?: string[];
  upgradeTo?: string;
  imageEmoji?: string;
};

export type PlacedCard = GameCard & {
  instanceId: string;
  x: number;
  y: number;
  connectedTo: string[];
  exhausted?: boolean;
};

export type ActiveProject = {
  id: string;
  cardId: string;
  progress: number;
  target: number;
  successChance: number;
  turnsRemaining: number;
};

export type GameStatus = "playing" | "won" | "lost";

export type GameState = {
  day: number;
  turn: number;
  resources: Resources;
  deck: GameCard[];
  hand: GameCard[];
  discardPile: GameCard[];
  placedCards: PlacedCard[];
  inventory: GameCard[];
  unlockedSkills: string[];
  activeProjects: ActiveProject[];
  completedProjects: string[];
  currentEvent?: GameCard;
  selectedCardId?: string;
  pendingPlacement?: GameCard;
  gameStatus: GameStatus;
  log: string[];
  tutorialStep: number;
  highestReputationLevel: number;
  sandboxMode: boolean;
  nextConnectionFree: boolean;
};

export type CraftRecipe = {
  id: string;
  name: string;
  ingredientIds: string[];
  resultCardId: string;
  cost?: Partial<Resources>;
  description: string;
};

export type SkillNode = {
  id: string;
  name: string;
  branch: "productivity" | "comfort" | "technical";
  description: string;
  cost: number;
  prerequisites: string[];
  effect: {
    resourceBonus?: Partial<Resources>;
    productionMultiplier?: number;
    unlockCardIds?: string[];
    connectionDiscount?: number;
  };
  iconEmoji: string;
};
