"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CanvasBoard } from "@/components/CanvasBoard";
import { EventBanner } from "@/components/EventBanner";
import { GameLog } from "@/components/GameLog";
import { HandBar } from "@/components/HandBar";
import { InspectorPanel } from "@/components/InspectorPanel";
import { InventoryView } from "@/components/InventoryView";
import { ProjectsView } from "@/components/ProjectsView";
import { ResourceBar } from "@/components/ResourceBar";
import { Sidebar, type GameView } from "@/components/Sidebar";
import { SkillTreeView } from "@/components/SkillTreeView";
import { StickyNote } from "@/components/StickyNote";
import {
  connectCards,
  continueInSandbox,
  craftRecipe,
  createInitialGameState,
  discardCard,
  endDay,
  getFinalGrade,
  launchProject,
  placeCard,
  playCard,
  removeInventoryCard,
  storeObjectCard,
  unlockSkill,
  upgradePlacedCard,
  consumeObjectCard,
} from "@/lib/gameLogic";
import { loadGame, saveGame } from "@/lib/storage";
import type { GameState, PlacedCard } from "@/types/game";

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (ms: number) => void;
  }
}

function createState() {
  return createInitialGameState();
}

export function GameShell() {
  const [state, setState] = useState<GameState>(() => createInitialGameState(() => 0.5));
  const skipInitialAutosave = useRef(true);
  const [activeView, setActiveView] = useState<GameView>("office");
  const [selectedHandCardId, setSelectedHandCardId] = useState<string>();
  const [selectedPlacedId, setSelectedPlacedId] = useState<string>();
  const [connectionSourceId, setConnectionSourceId] = useState<string>();

  const selectedHandCard = state.hand.find((card) => card.id === selectedHandCardId);
  const selectedPlacedCard = state.placedCards.find(
    (card) => card.instanceId === selectedPlacedId,
  );

  useEffect(() => {
    if (skipInitialAutosave.current) {
      skipInitialAutosave.current = false;
      return;
    }
    saveGame(state);
  }, [state]);

  useEffect(() => {
    window.render_game_to_text = () =>
      JSON.stringify({
        coordinateSystem: "origin top-left, x right, y down",
        day: state.day,
        resources: state.resources,
        hand: state.hand.map((card) => card.id),
        placedCards: state.placedCards.map((card) => ({
          id: card.id,
          instanceId: card.instanceId,
          x: card.x,
          y: card.y,
          connectedTo: card.connectedTo,
        })),
        activeProjects: state.activeProjects,
        completedProjects: state.completedProjects,
        unlockedSkills: state.unlockedSkills,
        currentEvent: state.currentEvent?.id,
        gameStatus: state.gameStatus,
      });
    window.advanceTime = () => undefined;
  }, [state]);

  const victoryGrade = useMemo(() => getFinalGrade(state), [state]);

  function run(update: (current: GameState) => GameState) {
    setState((current) => update(current));
  }

  function handleBoardClick(x: number, y: number) {
    if (!state.pendingPlacement) return;
    run((current) => placeCard(current, current.pendingPlacement!, x - 88, y - 82));
    setSelectedHandCardId(undefined);
  }

  function handlePlacedCardClick(card: PlacedCard) {
    if (connectionSourceId && connectionSourceId !== card.instanceId) {
      run((current) => connectCards(current, connectionSourceId, card.instanceId));
      setConnectionSourceId(undefined);
      setSelectedPlacedId(card.instanceId);
      return;
    }

    setSelectedPlacedId(card.instanceId);
    setSelectedHandCardId(undefined);
  }

  function handlePlaySelected() {
    if (!selectedHandCardId) return;
    run((current) => playCard(current, selectedHandCardId));
  }

  function handleDiscardSelected() {
    if (!selectedHandCardId) return;
    run((current) => discardCard(current, selectedHandCardId));
    setSelectedHandCardId(undefined);
  }

  function handleNewGame() {
    setState(createState());
    setSelectedHandCardId(undefined);
    setSelectedPlacedId(undefined);
    setConnectionSourceId(undefined);
    setActiveView("office");
  }

  function handleLoad() {
    const loaded = loadGame();
    if (loaded) {
      setState(loaded);
    }
  }

  function handleSave() {
    saveGame(state);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ResourceBar state={state} />
      <div className="flex flex-1 flex-col lg:flex-row">
        <Sidebar
          activeView={activeView}
          state={state}
          onViewChange={setActiveView}
          onNewGame={handleNewGame}
          onSave={handleSave}
          onLoad={handleLoad}
        />

        <main className="flex-1 space-y-4 p-4">
          <EventBanner event={state.currentEvent} />

          {activeView === "office" && (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
              <div className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <CanvasBoard
                    state={state}
                    selectedPlacedId={selectedPlacedId}
                    connectionSourceId={connectionSourceId}
                    onBoardClick={handleBoardClick}
                    onPlacedCardClick={handlePlacedCardClick}
                  />
                  <StickyNote tutorialStep={state.tutorialStep} />
                </div>
                <GameLog entries={state.log} />
              </div>
              <InspectorPanel
                state={state}
                handCard={selectedHandCard}
                placedCard={selectedPlacedCard}
                connectionSourceId={connectionSourceId}
                onPlay={handlePlaySelected}
                onStore={() => {
                  if (!selectedHandCardId) return;
                  run((current) => storeObjectCard(current, selectedHandCardId));
                  setSelectedHandCardId(undefined);
                }}
                onUse={() => {
                  if (!selectedHandCardId) return;
                  run((current) => consumeObjectCard(current, selectedHandCardId));
                  setSelectedHandCardId(undefined);
                }}
                onConnect={() => {
                  if (!selectedPlacedCard) return;
                  setConnectionSourceId(selectedPlacedCard.instanceId);
                }}
                onUpgrade={() => {
                  if (!selectedPlacedCard) return;
                  run((current) => upgradePlacedCard(current, selectedPlacedCard.instanceId));
                }}
              />
            </div>
          )}

          {activeView === "inventory" && (
            <InventoryView
              state={state}
              onCraft={(recipeId) => run((current) => craftRecipe(current, recipeId))}
              onUseInventory={(cardId) =>
                run((current) => consumeObjectCard(current, cardId, true))
              }
              onRemoveInventory={(index) => run((current) => removeInventoryCard(current, index))}
            />
          )}

          {activeView === "skills" && (
            <SkillTreeView
              state={state}
              onUnlock={(skillId) => run((current) => unlockSkill(current, skillId))}
            />
          )}

          {activeView === "projects" && (
            <ProjectsView
              state={state}
              onLaunch={(projectId) => run((current) => launchProject(current, projectId))}
            />
          )}
        </main>
      </div>

      <HandBar
        hand={state.hand}
        selectedCardId={selectedHandCardId}
        onSelect={(cardId) => {
          setSelectedHandCardId(cardId);
          setSelectedPlacedId(undefined);
        }}
        onPlay={handlePlaySelected}
        onDiscard={handleDiscardSelected}
        onEndDay={() => run((current) => endDay(current))}
      />

      {state.gameStatus === "won" && !state.sandboxMode && (
        <div className="overlay">
          <div className="paper-card max-w-lg bg-white p-6 text-center">
            <p className="text-5xl">🏆</p>
            <h2 className="mt-3 text-3xl font-black">Office légendaire !</h2>
            <p className="handwritten mt-3">
              Tu as transformé un bureau bricolé en véritable Office Village.
            </p>
            <div className="mt-4 grid gap-2 text-left sm:grid-cols-2">
              <p>Réputation : {state.resources.reputation}</p>
              <p>Bonheur : {state.resources.happiness}%</p>
              <p>Stress : {state.resources.stress}%</p>
              <p>Jours joués : {state.day}</p>
              <p>Projets terminés : {state.completedProjects.length}</p>
              <p>Grade : {victoryGrade}</p>
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button type="button" className="paper-button bg-[var(--yellow)]" onClick={handleNewGame}>
                Nouvelle partie
              </button>
              <button
                type="button"
                className="paper-button bg-[var(--mint)]"
                onClick={() => run((current) => continueInSandbox(current))}
              >
                Continuer en sandbox
              </button>
            </div>
          </div>
        </div>
      )}

      {state.gameStatus === "lost" && (
        <div className="overlay">
          <div className="paper-card max-w-lg bg-white p-6 text-center">
            <p className="text-5xl">🫠</p>
            <h2 className="mt-3 text-3xl font-black">Réorganisation générale</h2>
            <p className="handwritten mt-3">
              Ton équipe a craqué sous le poids des réunions, des bugs et des cafés froids.
            </p>
            <p className="handwritten mt-2">Mais chaque échec laisse une leçon.</p>
            <button
              type="button"
              className="paper-button mt-5 bg-[var(--pink)]"
              onClick={handleNewGame}
            >
              Recommencer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
