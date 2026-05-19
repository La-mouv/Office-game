import { describe, expect, it } from "vitest";
import { ALL_CARDS, getCardById } from "../src/lib/cards";
import {
  applyResourceChange,
  calculateProduction,
  connectCards,
  craftRecipe,
  createInitialGameState,
  endDay,
  launchProject,
  placeCard,
  playCard,
  triggerRandomEvent,
  unlockSkill,
} from "../src/lib/gameLogic";
import type { GameState, PlacedCard } from "../src/types/game";

const fixedRng = () => 0;

function withPlacedCards(...cardIds: string[]): GameState {
  let state = createInitialGameState(fixedRng);
  state = { ...state, placedCards: [] };

  cardIds.forEach((cardId, index) => {
    const card = getCardById(cardId);
    state = placeCard(state, card, 120 + index * 180, 140);
  });

  return state;
}

describe("Office Village game logic", () => {
  it("creates a playable initial state", () => {
    const state = createInitialGameState(fixedRng);

    expect(state.day).toBe(1);
    expect(state.hand).toHaveLength(5);
    expect(state.deck.length + state.hand.length).toBe(10);
    expect(state.placedCards).toHaveLength(1);
    expect(state.placedCards[0]?.id).toBe("starting-desk");
    expect(state.resources.ideas).toBe(5);
    expect(ALL_CARDS).toHaveLength(39);
  });

  it("pays a card cost and places it after play", () => {
    let state = createInitialGameState(fixedRng);
    state = { ...state, hand: [getCardById("open-space")] };

    state = playCard(state, "open-space");
    expect(state.pendingPlacement?.id).toBe("open-space");
    expect(state.resources.budget).toBe(20);

    state = placeCard(state, getCardById("open-space"), 300, 220);
    expect(state.pendingPlacement).toBeUndefined();
    expect(state.placedCards.some((card) => card.id === "open-space")).toBe(true);
  });

  it("refuses an unaffordable card and logs why", () => {
    let state = createInitialGameState(fixedRng);
    state = {
      ...state,
      resources: { ...state.resources, budget: 0 },
      hand: [getCardById("open-space")],
    };

    state = playCard(state, "open-space");

    expect(state.pendingPlacement).toBeUndefined();
    expect(state.log.at(-1)).toContain("Pas assez de budget");
  });

  it("keeps storage-only objects in hand when play is pressed", () => {
    let state = createInitialGameState(fixedRng);
    state = { ...state, hand: [getCardById("cable")] };

    state = playCard(state, "cable");

    expect(state.hand).toHaveLength(1);
    expect(state.discardPile).toHaveLength(0);
    expect(state.log.at(-1)).toContain("stocké");
  });

  it("creates bidirectional links, spends post-its, and applies bonuses", () => {
    let state = withPlacedCards("coffee-corner", "open-space");
    state = {
      ...state,
      resources: { ...state.resources, postIts: 2 },
    };

    const [coffee, openSpace] = state.placedCards as [PlacedCard, PlacedCard];
    state = connectCards(state, coffee.instanceId, openSpace.instanceId);

    expect(state.resources.postIts).toBe(1);
    expect(state.placedCards[0]?.connectedTo).toContain(openSpace.instanceId);
    expect(state.placedCards[1]?.connectedTo).toContain(coffee.instanceId);
    expect(calculateProduction(state)).toMatchObject({ energy: 3, ideas: 4 });
  });

  it("alternates free connections after Empire du Post-it", () => {
    let state = withPlacedCards("coffee-corner", "open-space", "project-room");
    state = {
      ...state,
      unlockedSkills: ["productivity-postit-empire"],
      resources: { ...state.resources, postIts: 2 },
      nextConnectionFree: true,
    };

    const [first, second, third] = state.placedCards as [
      PlacedCard,
      PlacedCard,
      PlacedCard,
    ];

    state = connectCards(state, first.instanceId, second.instanceId);
    expect(state.resources.postIts).toBe(2);
    expect(state.nextConnectionFree).toBe(false);

    state = connectCards(state, second.instanceId, third.instanceId);
    expect(state.resources.postIts).toBe(1);
    expect(state.nextConnectionFree).toBe(true);
  });

  it("removes meeting-room stress after the matching skill", () => {
    const state = {
      ...withPlacedCards("meeting-room"),
      unlockedSkills: ["productivity-efficient-meetings"],
    };

    expect(calculateProduction(state).stress ?? 0).toBe(0);
  });

  it("fires deterministic events every third day", () => {
    const state = {
      ...createInitialGameState(fixedRng),
      day: 3,
      resources: {
        ...createInitialGameState(fixedRng).resources,
        stress: 10,
      },
    };

    const nextState = triggerRandomEvent(state, fixedRng);

    expect(nextState.currentEvent?.id).toBe("client-visit");
    expect(nextState.resources.reputation).toBe(8);
  });

  it("launches normal projects instantly and final projects over three days", () => {
    let state = {
      ...createInitialGameState(fixedRng),
      resources: {
        ...createInitialGameState(fixedRng).resources,
        ideas: 200,
        energy: 100,
        budget: 500,
        reputation: 120,
      },
    };

    state = launchProject(state, "wobbly-prototype", fixedRng);
    expect(state.completedProjects).toContain("wobbly-prototype");
    expect(state.resources.reputation).toBeGreaterThan(120);

    state = launchProject(state, "final-project", fixedRng);
    expect(state.activeProjects).toHaveLength(1);
    expect(state.activeProjects[0]?.turnsRemaining).toBe(3);
  });

  it("unlocks skills and crafts recipes", () => {
    let state = {
      ...createInitialGameState(fixedRng),
      resources: {
        ...createInitialGameState(fixedRng).resources,
        ideas: 20,
        budget: 100,
        talentPoints: 2,
      },
      inventory: [getCardById("post-it"), getCardById("boss-mug")],
    };

    state = unlockSkill(state, "productivity-organization");
    expect(state.unlockedSkills).toContain("productivity-organization");
    expect(state.resources.talentPoints).toBe(1);

    state = craftRecipe(state, "craft-productive-brainstorm");
    expect(state.hand.some((card) => card.id === "brainstorm-express")).toBe(true);
    expect(state.inventory).toHaveLength(0);
  });

  it("grants reputation talent points once per new level and resolves win/loss", () => {
    let state = {
      ...createInitialGameState(fixedRng),
      resources: {
        ...createInitialGameState(fixedRng).resources,
        reputation: 49,
      },
    };

    state = applyResourceChange(state, { reputation: 2 });
    expect(state.resources.talentPoints).toBe(1);

    const afterRepeat = applyResourceChange(state, { reputation: 0 });
    expect(afterRepeat.resources.talentPoints).toBe(1);

    const winningState = endDay(
      {
        ...afterRepeat,
        day: 4,
        resources: {
          ...afterRepeat.resources,
          reputation: 250,
        },
        completedProjects: ["final-project"],
      },
      fixedRng,
    );
    expect(winningState.gameStatus).toBe("won");

    const losingState = endDay(
      {
        ...afterRepeat,
        resources: {
          ...afterRepeat.resources,
          stress: 100,
        },
      },
      fixedRng,
    );
    expect(losingState.gameStatus).toBe("lost");
  });
});
