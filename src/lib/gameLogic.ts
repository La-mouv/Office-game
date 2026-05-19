import { EVENT_CARDS, PROJECT_CARDS, STARTER_DECK_IDS, getCardById } from "@/lib/cards";
import { CRAFT_RECIPES } from "@/lib/recipes";
import { SKILL_NODES } from "@/lib/skills";
import type {
  ActiveProject,
  GameCard,
  GameState,
  PlacedCard,
  Resources,
  SkillNode,
} from "@/types/game";

export const STARTING_RESOURCES: Resources = {
  ideas: 5,
  energy: 10,
  budget: 50,
  happiness: 70,
  reputation: 0,
  stress: 0,
  postIts: 2,
  talentPoints: 0,
};

export const INVENTORY_LIMIT = 20;
export const HAND_LIMIT = 8;

export const TUTORIAL_OBJECTIVES = [
  "Joue une carte Personnage",
  "Construis une salle",
  "Crée une connexion",
  "Lance un projet",
  "Débloque un skill",
];

const RESOURCE_LABELS: Record<keyof Resources, string> = {
  ideas: "idées",
  energy: "énergie",
  budget: "budget",
  happiness: "bonheur",
  reputation: "réputation",
  stress: "stress",
  postIts: "post-its",
  talentPoints: "points de talent",
};

export const CONNECTION_RULES = [
  {
    a: "coffee-corner",
    b: "open-space",
    bonus: { energy: 1, ideas: 1 },
    label: "Synergie caféinée",
  },
  {
    a: "project-room",
    b: "motivated-intern",
    bonus: { ideas: 1 },
    label: "Apprentissage accéléré",
  },
  {
    a: "relax-corner",
    b: "tired-dev",
    bonus: { stress: -1, energy: 1 },
    label: "Pause utile",
  },
  {
    a: "prototype-lab",
    b: "senior-dev",
    bonus: { reputation: 2 },
    label: "Prototype maîtrisé",
  },
  {
    a: "creative-studio",
    b: "overloaded-designer",
    bonus: { ideas: 2 },
    label: "Créativité canalisée",
  },
  {
    a: "meeting-room",
    b: "inspiring-manager",
    bonus: { happiness: 1, ideas: 1 },
    label: "Réunion presque utile",
  },
] as const;

export function appendLog(state: GameState, message: string): GameState {
  return {
    ...state,
    log: [...state.log, `Jour ${state.day} : ${message}`].slice(-8),
  };
}

export function shuffleDeck(deck: GameCard[], rng = Math.random): GameCard[] {
  const nextDeck = [...deck];

  for (let index = nextDeck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [nextDeck[index], nextDeck[swapIndex]] = [nextDeck[swapIndex], nextDeck[index]];
  }

  return nextDeck;
}

export function getHappinessMultiplier(happiness: number): number {
  if (happiness >= 90) return 1.2;
  if (happiness >= 70) return 1;
  if (happiness >= 50) return 0.9;
  if (happiness >= 30) return 0.75;
  return 0.5;
}

export function clampResources(resources: Resources): Resources {
  return {
    ideas: Math.max(0, Math.round(resources.ideas)),
    energy: Math.max(0, Math.round(resources.energy)),
    budget: Math.max(0, Math.round(resources.budget)),
    happiness: Math.min(100, Math.max(0, Math.round(resources.happiness))),
    reputation: Math.max(0, Math.round(resources.reputation)),
    stress: Math.min(100, Math.max(0, Math.round(resources.stress))),
    postIts: Math.max(0, Math.round(resources.postIts)),
    talentPoints: Math.max(0, Math.round(resources.talentPoints)),
  };
}

function reputationLevel(reputation: number): number {
  return Math.floor(reputation / 50) + 1;
}

function withTalentProgression(state: GameState, nextResources: Resources): GameState {
  const nextLevel = reputationLevel(nextResources.reputation);
  const gainedLevels = Math.max(0, nextLevel - state.highestReputationLevel);

  return {
    ...state,
    highestReputationLevel: Math.max(state.highestReputationLevel, nextLevel),
    resources: {
      ...nextResources,
      talentPoints: nextResources.talentPoints + gainedLevels,
    },
  };
}

export function applyResourceChange(
  state: GameState,
  delta: Partial<Resources>,
): GameState {
  const adjustedDelta = { ...delta };

  if (
    adjustedDelta.stress &&
    adjustedDelta.stress > 0 &&
    state.unlockedSkills.includes("comfort-zen-office")
  ) {
    adjustedDelta.stress *= 0.75;
  }

  const nextResources = clampResources({
    ...state.resources,
    ...Object.fromEntries(
      (Object.keys(state.resources) as (keyof Resources)[]).map((key) => [
        key,
        state.resources[key] + (adjustedDelta[key] ?? 0),
      ]),
    ),
  } as Resources);

  return withTalentProgression(state, nextResources);
}

function canAfford(resources: Resources, cost?: Partial<Resources>): boolean {
  if (!cost) return true;
  return (Object.keys(cost) as (keyof Resources)[]).every(
    (key) => resources[key] >= (cost[key] ?? 0),
  );
}

function firstMissingResource(
  resources: Resources,
  cost?: Partial<Resources>,
): keyof Resources | undefined {
  if (!cost) return undefined;

  return (Object.keys(cost) as (keyof Resources)[]).find(
    (key) => resources[key] < (cost[key] ?? 0),
  );
}

function payCost(state: GameState, cost?: Partial<Resources>): GameState {
  if (!cost) return state;

  const payment = Object.fromEntries(
    (Object.keys(cost) as (keyof Resources)[]).map((key) => [key, -(cost[key] ?? 0)]),
  ) as Partial<Resources>;

  return applyResourceChange(state, payment);
}

function removeCardFromHand(state: GameState, cardId: string): [GameState, GameCard?] {
  const index = state.hand.findIndex((card) => card.id === cardId);
  if (index === -1) return [state, undefined];

  const card = state.hand[index];
  return [
    {
      ...state,
      hand: state.hand.filter((_, handIndex) => handIndex !== index),
    },
    card,
  ];
}

function nextPlacedInstanceId(state: GameState, cardId: string): string {
  const usedNumbers = state.placedCards
    .filter((card) => card.id === cardId)
    .map((card) => Number(card.instanceId.split("-").at(-1)))
    .filter((value) => Number.isFinite(value));
  const nextNumber = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 1;

  return `${cardId}-${nextNumber}`;
}

function addCardToHand(state: GameState, card: GameCard): GameState {
  return enforceHandLimit({
    ...state,
    hand: [...state.hand, card],
  });
}

function enforceHandLimit(state: GameState): GameState {
  if (state.hand.length <= HAND_LIMIT) return state;

  const keptCards = state.hand.slice(0, HAND_LIMIT);
  const overflow = state.hand.slice(HAND_LIMIT);

  return appendLog(
    {
      ...state,
      hand: keptCards,
      discardPile: [...state.discardPile, ...overflow],
    },
    `${overflow.length} carte(s) excédentaire(s) envoyée(s) en défausse.`,
  );
}

export function drawCards(
  state: GameState,
  count: number,
  rng = Math.random,
): GameState {
  let deck = [...state.deck];
  let discardPile = [...state.discardPile];
  const hand = [...state.hand];

  for (let drawIndex = 0; drawIndex < count; drawIndex += 1) {
    if (deck.length === 0 && discardPile.length > 0) {
      deck = shuffleDeck(discardPile, rng);
      discardPile = [];
    }

    const card = deck.shift();
    if (!card) break;
    hand.push(card);
  }

  return enforceHandLimit({
    ...state,
    deck,
    discardPile,
    hand,
  });
}

export function createInitialGameState(rng = Math.random): GameState {
  const deck = shuffleDeck(STARTER_DECK_IDS.map(getCardById), rng);
  const startingDesk = getCardById("starting-desk");

  const baseState: GameState = {
    day: 1,
    turn: 1,
    resources: { ...STARTING_RESOURCES },
    deck,
    hand: [],
    discardPile: [],
    placedCards: [
      {
        ...startingDesk,
        instanceId: "starting-desk-1",
        x: 100,
        y: 180,
        connectedTo: [],
      },
    ],
    inventory: [],
    unlockedSkills: [],
    activeProjects: [],
    completedProjects: [],
    gameStatus: "playing",
    log: ["Jour 1 : Bienvenue dans Office Village."],
    tutorialStep: 0,
    highestReputationLevel: 1,
    sandboxMode: false,
    nextConnectionFree: false,
  };

  return drawCards(baseState, 5, rng);
}

function tutorialReward(step: number): Partial<Resources> | undefined {
  switch (step) {
    case 0:
      return { ideas: 5 };
    case 1:
      return { budget: 10 };
    case 2:
      return { postIts: 2 };
    case 3:
      return { reputation: 10 };
    default:
      return undefined;
  }
}

function completeTutorialStep(state: GameState, expectedStep: number): GameState {
  if (state.tutorialStep !== expectedStep) return state;

  let nextState = {
    ...state,
    tutorialStep: state.tutorialStep + 1,
  };

  const reward = tutorialReward(expectedStep);
  if (reward) {
    nextState = applyResourceChange(nextState, reward);
  }

  if (expectedStep === 4) {
    nextState = addCardToHand(nextState, getCardById("senior-dev"));
  }

  return appendLog(nextState, `Objectif tutoriel accompli : ${TUTORIAL_OBJECTIVES[expectedStep]}.`);
}

export function playCard(state: GameState, cardId: string, rng = Math.random): GameState {
  const [withoutCard, card] = removeCardFromHand(state, cardId);
  if (!card) return appendLog(state, "Cette carte n’est plus dans ta main.");

  const missingResource = firstMissingResource(state.resources, card.cost);
  if (missingResource) {
    return appendLog(state, `Pas assez de ${RESOURCE_LABELS[missingResource]} pour jouer ${card.name}.`);
  }

  if (card.type === "project") {
    const launched = launchProject(state, card.id, rng);
    if (launched === state) return state;

    return {
      ...launched,
      hand: withoutCard.hand,
      discardPile: [...launched.discardPile, card],
    };
  }

  let nextState = payCost(withoutCard, card.cost);

  if (card.type === "building" || card.type === "person" || card.production) {
    nextState = {
      ...nextState,
      pendingPlacement: card,
    };

    return appendLog(nextState, `Choisis un emplacement pour ${card.name}.`);
  }

  if (card.type === "object" && !card.instantEffect) {
    return appendLog(
      state,
      `${card.name} doit être stocké dans l’inventaire plutôt que joué directement.`,
    );
  }

  if (card.instantEffect) {
    nextState = applyResourceChange(nextState, card.instantEffect);
  }

  nextState = {
    ...nextState,
    discardPile: [...nextState.discardPile, card],
  };

  return appendLog(nextState, `${card.name} a été joué.`);
}

export function discardCard(state: GameState, cardId: string): GameState {
  const [withoutCard, card] = removeCardFromHand(state, cardId);
  if (!card) return state;

  return appendLog(
    {
      ...withoutCard,
      discardPile: [...withoutCard.discardPile, card],
    },
    `${card.name} a été défaussé.`,
  );
}

export function placeCard(
  state: GameState,
  card: GameCard,
  x: number,
  y: number,
): GameState {
  const placedCard: PlacedCard = {
    ...card,
    instanceId: nextPlacedInstanceId(state, card.id),
    x,
    y,
    connectedTo: [],
  };

  let nextState = appendLog(
    {
      ...state,
      pendingPlacement: undefined,
      placedCards: [...state.placedCards, placedCard],
    },
    `${card.name} a été placé sur le bureau.`,
  );

  if (card.type === "person") {
    nextState = completeTutorialStep(nextState, 0);
  }

  if (card.type === "building") {
    nextState = completeTutorialStep(nextState, 1);
  }

  return nextState;
}

export function getConnectionBonus(
  cardA: PlacedCard,
  cardB: PlacedCard,
): Partial<Resources> {
  const rule = CONNECTION_RULES.find(
    ({ a, b }) =>
      (cardA.id === a && cardB.id === b) || (cardA.id === b && cardB.id === a),
  );

  return rule?.bonus ?? {};
}

function hasFreeConnection(state: GameState): boolean {
  return (
    state.unlockedSkills.includes("productivity-postit-empire") &&
    state.nextConnectionFree
  );
}

export function connectCards(
  state: GameState,
  sourceInstanceId: string,
  targetInstanceId: string,
): GameState {
  if (sourceInstanceId === targetInstanceId) {
    return appendLog(state, "Une carte ne peut pas se connecter à elle-même.");
  }

  const source = state.placedCards.find((card) => card.instanceId === sourceInstanceId);
  const target = state.placedCards.find((card) => card.instanceId === targetInstanceId);

  if (!source || !target) {
    return appendLog(state, "Connexion impossible : carte introuvable.");
  }

  if (source.connectedTo.includes(targetInstanceId)) {
    return appendLog(state, "Ces deux cartes sont déjà connectées.");
  }

  if (
    source.connectedTo.length >= (source.connectionsMax ?? Number.POSITIVE_INFINITY) ||
    target.connectedTo.length >= (target.connectionsMax ?? Number.POSITIVE_INFINITY)
  ) {
    return appendLog(state, "Une des deux cartes a déjà atteint sa limite de connexions.");
  }

  const isFree = hasFreeConnection(state);
  if (!isFree && state.resources.postIts < 1) {
    return appendLog(state, "Pas assez de post-its pour créer une connexion.");
  }

  const placedCards = state.placedCards.map((card) => {
    if (card.instanceId === sourceInstanceId) {
      return { ...card, connectedTo: [...card.connectedTo, targetInstanceId] };
    }

    if (card.instanceId === targetInstanceId) {
      return { ...card, connectedTo: [...card.connectedTo, sourceInstanceId] };
    }

    return card;
  });

  let nextState = {
    ...state,
    placedCards,
    nextConnectionFree: state.unlockedSkills.includes("productivity-postit-empire")
      ? !state.nextConnectionFree
      : false,
  };

  if (!isFree) {
    nextState = applyResourceChange(nextState, { postIts: -1 });
  }

  nextState = completeTutorialStep(nextState, 2);
  return appendLog(nextState, `${source.name} est connecté à ${target.name}.`);
}

export function calculateProduction(state: GameState): Partial<Resources> {
  const totals: Partial<Resources> = {};

  state.placedCards.forEach((card) => {
    if (!card.production) return;

    Object.entries(card.production).forEach(([resource, amount]) => {
      const key = resource as keyof Resources;
      if (
        card.id === "meeting-room" &&
        key === "stress" &&
        state.unlockedSkills.includes("productivity-efficient-meetings")
      ) {
        return;
      }

      const levelMultiplier = 1 + 0.5 * (card.level - 1);
      totals[key] = (totals[key] ?? 0) + amount * levelMultiplier;
    });
  });

  const visitedPairs = new Set<string>();
  state.placedCards.forEach((card) => {
    card.connectedTo.forEach((connectedId) => {
      const pairKey = [card.instanceId, connectedId].sort().join("::");
      if (visitedPairs.has(pairKey)) return;
      visitedPairs.add(pairKey);

      const connectedCard = state.placedCards.find(
        (candidate) => candidate.instanceId === connectedId,
      );
      if (!connectedCard) return;

      const bonus = getConnectionBonus(card, connectedCard);
      Object.entries(bonus).forEach(([resource, amount]) => {
        const key = resource as keyof Resources;
        totals[key] = (totals[key] ?? 0) + amount;
      });
    });
  });

  const happinessMultiplier = getHappinessMultiplier(state.resources.happiness);
  (Object.keys(totals) as (keyof Resources)[]).forEach((key) => {
    const amount = totals[key] ?? 0;
    if (amount > 0 && key !== "happiness" && key !== "stress") {
      totals[key] = amount * happinessMultiplier;
    }
  });

  state.unlockedSkills.forEach((skillId) => {
    const skill = SKILL_NODES.find((node) => node.id === skillId);
    Object.entries(skill?.effect.resourceBonus ?? {}).forEach(([resource, amount]) => {
      const key = resource as keyof Resources;
      totals[key] = (totals[key] ?? 0) + amount;
    });
  });

  return Object.fromEntries(
    Object.entries(totals).map(([resource, amount]) => [resource, Math.round(amount)]),
  ) as Partial<Resources>;
}

export function calculateProjectSuccessChance(
  state: GameState,
  project: GameCard,
): number {
  let chance = 70;

  if (state.resources.happiness >= 80) chance += 10;
  if (state.resources.stress >= 60) chance -= 20;
  if (state.placedCards.some((card) => card.id === "project-room")) chance += 10;
  if (state.placedCards.some((card) => card.id === "senior-dev")) chance += 10;
  if (state.placedCards.some((card) => card.id === "prototype-lab")) chance += 10;
  if (project.id === "wobbly-prototype") chance -= 10;
  if (project.id === "final-project") chance -= 20;

  return Math.max(10, Math.min(95, chance));
}

function resolveProject(
  state: GameState,
  project: GameCard,
  successChance: number,
  rng = Math.random,
): GameState {
  const succeeded = rng() * 100 < successChance;

  if (succeeded) {
    let nextState = applyResourceChange(state, project.instantEffect ?? {});
    nextState = {
      ...nextState,
      completedProjects: [...nextState.completedProjects, project.id],
    };
    return appendLog(nextState, `${project.name} réussi !`);
  }

  return appendLog(
    applyResourceChange(state, { stress: 2, reputation: -5 }),
    `${project.name} a échoué, mais l’équipe apprend.`,
  );
}

export function launchProject(
  state: GameState,
  projectId: string,
  rng = Math.random,
): GameState {
  const project = PROJECT_CARDS.find((card) => card.id === projectId);
  if (!project) return appendLog(state, "Projet introuvable.");

  if (project.id === "final-project" && state.activeProjects.some((item) => item.cardId === project.id)) {
    return appendLog(state, "Le Grand Projet final est déjà en cours.");
  }

  if (!canAfford(state.resources, project.cost)) {
    const missing = firstMissingResource(state.resources, project.cost);
    return appendLog(
      state,
      `Pas assez de ${missing ? RESOURCE_LABELS[missing] : "ressources"} pour lancer ${project.name}.`,
    );
  }

  let nextState = payCost(state, project.cost);
  nextState = completeTutorialStep(nextState, 3);
  const successChance = calculateProjectSuccessChance(nextState, project);

  if (project.id === "final-project") {
    const activeProject: ActiveProject = {
      id: `active-${project.id}-${state.day}`,
      cardId: project.id,
      progress: 0,
      target: 3,
      successChance,
      turnsRemaining: 3,
    };

    return appendLog(
      {
        ...nextState,
        activeProjects: [...nextState.activeProjects, activeProject],
      },
      `${project.name} lancé. Résolution dans 3 jours.`,
    );
  }

  return resolveProject(nextState, project, successChance, rng);
}

function progressActiveProjects(state: GameState, rng = Math.random): GameState {
  let nextState = state;
  const remainingProjects: ActiveProject[] = [];

  state.activeProjects.forEach((project) => {
    const progressedProject = {
      ...project,
      progress: project.progress + 1,
      turnsRemaining: project.turnsRemaining - 1,
    };

    if (progressedProject.turnsRemaining > 0) {
      remainingProjects.push(progressedProject);
      return;
    }

    nextState = resolveProject(
      nextState,
      getCardById(progressedProject.cardId),
      progressedProject.successChance,
      rng,
    );
  });

  return {
    ...nextState,
    activeProjects: remainingProjects,
  };
}

export function triggerRandomEvent(
  state: GameState,
  rng = Math.random,
): GameState {
  const positiveChance =
    state.resources.stress < 40 ? 0.6 : state.resources.stress <= 70 ? 0.4 : 0.2;
  const shouldPickPositive = rng() < positiveChance;
  const eligibleEvents = EVENT_CARDS.filter((event) =>
    event.tags.includes(shouldPickPositive ? "positive" : "negative"),
  );
  const event = eligibleEvents[Math.floor(rng() * eligibleEvents.length)];

  let nextState = applyResourceChange(state, event.instantEffect ?? {});
  nextState = {
    ...nextState,
    currentEvent: event,
  };

  return appendLog(nextState, `Événement : ${event.name}.`);
}

export function unlockSkill(state: GameState, skillId: string): GameState {
  const skill = SKILL_NODES.find((candidate) => candidate.id === skillId);
  if (!skill) return appendLog(state, "Compétence introuvable.");
  if (state.unlockedSkills.includes(skill.id)) return state;
  if (!skill.prerequisites.every((id) => state.unlockedSkills.includes(id))) {
    return appendLog(state, "Les prérequis de cette compétence ne sont pas remplis.");
  }
  if (state.resources.talentPoints < skill.cost) {
    return appendLog(state, "Pas assez de points de talent.");
  }

  let nextState = applyResourceChange(state, { talentPoints: -skill.cost });
  nextState = {
    ...nextState,
    unlockedSkills: [...nextState.unlockedSkills, skill.id],
    nextConnectionFree:
      skill.id === "productivity-postit-empire" ? true : nextState.nextConnectionFree,
  };
  nextState = completeTutorialStep(nextState, 4);
  return appendLog(nextState, `${skill.name} débloqué.`);
}

export function craftRecipe(state: GameState, recipeId: string): GameState {
  const recipe = CRAFT_RECIPES.find((candidate) => candidate.id === recipeId);
  if (!recipe) return appendLog(state, "Recette introuvable.");

  if (!canAfford(state.resources, recipe.cost)) {
    return appendLog(state, "Pas assez de ressources pour cette recette.");
  }

  const inventoryCopy = [...state.inventory];
  for (const ingredientId of recipe.ingredientIds) {
    const index = inventoryCopy.findIndex((card) => card.id === ingredientId);
    if (index === -1) {
      return appendLog(state, "Il manque des ingrédients pour cette recette.");
    }
    inventoryCopy.splice(index, 1);
  }

  let nextState = payCost(
    {
      ...state,
      inventory: inventoryCopy,
    },
    recipe.cost,
  );

  nextState = addCardToHand(nextState, getCardById(recipe.resultCardId));
  return appendLog(nextState, `${recipe.name} fabriqué.`);
}

export function storeObjectCard(state: GameState, cardId: string): GameState {
  const [withoutCard, card] = removeCardFromHand(state, cardId);
  if (!card || card.type !== "object") return state;
  if (state.inventory.length >= INVENTORY_LIMIT) {
    return appendLog(state, "L’inventaire est plein.");
  }
  if (!canAfford(state.resources, card.cost)) {
    const missing = firstMissingResource(state.resources, card.cost);
    return appendLog(
      state,
      `Pas assez de ${missing ? RESOURCE_LABELS[missing] : "ressources"} pour stocker ${card.name}.`,
    );
  }

  return appendLog(
    {
      ...payCost(withoutCard, card.cost),
      inventory: [...state.inventory, card],
    },
    `${card.name} stocké dans l’inventaire.`,
  );
}

export function consumeObjectCard(
  state: GameState,
  cardId: string,
  fromInventory = false,
): GameState {
  if (fromInventory) {
    const index = state.inventory.findIndex((card) => card.id === cardId);
    if (index === -1) return state;
    const card = state.inventory[index];
    if (!card.instantEffect) return appendLog(state, `${card.name} ne peut pas être utilisé directement.`);

    const nextState = applyResourceChange(
      {
        ...state,
        inventory: state.inventory.filter((_, inventoryIndex) => inventoryIndex !== index),
      },
      card.instantEffect,
    );
    return appendLog(nextState, `${card.name} utilisé depuis l’inventaire.`);
  }

  const [withoutCard, card] = removeCardFromHand(state, cardId);
  if (!card || card.type !== "object") return state;
  if (!card.instantEffect) return appendLog(state, `${card.name} ne peut pas être utilisé directement.`);
  if (!canAfford(state.resources, card.cost)) {
    const missing = firstMissingResource(state.resources, card.cost);
    return appendLog(
      state,
      `Pas assez de ${missing ? RESOURCE_LABELS[missing] : "ressources"} pour utiliser ${card.name}.`,
    );
  }

  let nextState = payCost(withoutCard, card.cost);
  nextState = applyResourceChange(nextState, card.instantEffect);
  nextState = {
    ...nextState,
    discardPile: [...nextState.discardPile, card],
  };
  return appendLog(nextState, `${card.name} utilisé.`);
}

export function removeInventoryCard(state: GameState, index: number): GameState {
  const card = state.inventory[index];
  if (!card) return state;

  return appendLog(
    {
      ...state,
      inventory: state.inventory.filter((_, inventoryIndex) => inventoryIndex !== index),
    },
    `${card.name} supprimé de l’inventaire.`,
  );
}

export function upgradePlacedCard(
  state: GameState,
  instanceId: string,
): GameState {
  const card = state.placedCards.find((candidate) => candidate.instanceId === instanceId);
  if (!card) return state;
  if (card.level >= (card.maxLevel ?? 3)) return appendLog(state, `${card.name} est déjà au niveau maximum.`);

  const upgradeCost = {
    budget: 20 * card.level,
    ideas: 5 * card.level,
  };

  if (!canAfford(state.resources, upgradeCost)) {
    return appendLog(state, `Pas assez de ressources pour améliorer ${card.name}.`);
  }

  const nextState = payCost(state, upgradeCost);
  return appendLog(
    {
      ...nextState,
      placedCards: nextState.placedCards.map((candidate) =>
        candidate.instanceId === instanceId
          ? { ...candidate, level: candidate.level + 1 }
          : candidate,
      ),
    },
    `${card.name} passe au niveau ${card.level + 1}.`,
  );
}

export function checkWinLoss(state: GameState): GameState {
  if (
    !state.sandboxMode &&
    state.resources.reputation >= 250 &&
    state.completedProjects.includes("final-project")
  ) {
    return {
      ...state,
      gameStatus: "won",
    };
  }

  if (!state.sandboxMode && (state.resources.stress >= 100 || state.resources.happiness <= 0)) {
    return {
      ...state,
      gameStatus: "lost",
    };
  }

  return state;
}

export function endDay(state: GameState, rng = Math.random): GameState {
  if (state.gameStatus !== "playing" && !state.sandboxMode) return state;

  let nextState = appendLog(
    applyResourceChange(
      {
        ...state,
        currentEvent: undefined,
      },
      calculateProduction(state),
    ),
    "La journée se termine et le bureau produit ses ressources.",
  );

  nextState = progressActiveProjects(nextState, rng);

  if (state.day % 3 === 0) {
    nextState = triggerRandomEvent(nextState, rng);
  }

  const drawCount = state.unlockedSkills.includes("technical-macro") ? 3 : 2;
  nextState = drawCards(nextState, drawCount, rng);
  nextState = checkWinLoss(nextState);

  return {
    ...nextState,
    day: state.day + 1,
    turn: state.turn + 1,
  };
}

export function getFinalGrade(state: GameState): string {
  if (state.resources.reputation < 100) return "Bureau en carton";
  if (state.resources.reputation < 200) return "Open Space correct";
  if (state.resources.reputation < 350) return "Machine à idées";
  if (state.resources.reputation < 500) return "Village productif";
  return "Empire du Post-it";
}

export function continueInSandbox(state: GameState): GameState {
  return appendLog(
    {
      ...state,
      sandboxMode: true,
      gameStatus: "playing",
    },
    "Mode sandbox activé. Le bureau continue de vivre.",
  );
}

export function getSkillById(skillId: string): SkillNode | undefined {
  return SKILL_NODES.find((skill) => skill.id === skillId);
}
