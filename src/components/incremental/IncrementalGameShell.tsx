"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GameAssetImage } from "@/components/incremental/GameAssetImage";
import { OfficeView } from "@/components/incremental/OfficeView";
import {
  buyOrUpgradeLocation,
  buyWorker,
  calculateProduction,
  continueInSandbox,
  createInitialGameState,
  gameTick,
  resolveIncidentChoice,
  unlockSkill,
  upgradeWorker,
  useManualAction as performManualAction,
} from "@/lib/incrementalGame";
import { loadGame, saveGame } from "@/lib/incrementalStorage";
import {
  buildGainBubbleLabels,
  diffResources,
  getSceneReaction,
  type GainBubble,
  type SceneReaction,
} from "@/lib/incrementalPresentation";
import type { GameState } from "@/types/incremental";

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (ms: number) => void;
  }
}

export function IncrementalGameShell() {
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(0);
  const [state, setState] = useState<GameState>(() => createInitialGameState(0));
  const [gainBubbles, setGainBubbles] = useState<GainBubble[]>([]);
  const [sceneReaction, setSceneReaction] = useState<SceneReaction>(null);
  const latestStateRef = useRef(state);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const timestamp = Date.now();
      setNow(timestamp);
      setState(loadGame() ?? createInitialGameState(timestamp));
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    latestStateRef.current = state;
    if (hydrated) {
      saveGame(state);
    }
  }, [hydrated, state]);

  useEffect(() => {
    if (!hydrated) return undefined;

    const tickTimer = window.setInterval(() => {
      const timestamp = Date.now();
      setNow(timestamp);
      setState((current) => gameTick(current, timestamp));
    }, 1000);

    const autosaveTimer = window.setInterval(() => {
      saveGame(latestStateRef.current);
    }, 5000);

    return () => {
      window.clearInterval(tickTimer);
      window.clearInterval(autosaveTimer);
    };
  }, [hydrated]);

  useEffect(() => {
    window.render_game_to_text = () =>
      JSON.stringify({
        resources: state.resources,
        workers: state.workers.map((worker) => ({
          id: worker.id,
          count: worker.count,
          level: worker.level,
        })),
        locations: state.locations.map((location) => ({
          id: location.id,
          owned: location.owned,
          level: location.level,
        })),
        activeMission: state.activeMission?.id ?? null,
        activeBoosts: state.activeBoosts.map((boost) => ({
          id: boost.id,
          expiresAt: boost.expiresAt,
        })),
        activeIncident: state.activeIncident?.id ?? null,
        completed: state.completed,
      });
    window.advanceTime = (ms: number) => {
      setState((current) => gameTick(current, current.lastTickAt + ms));
      setNow((current) => current + ms);
    };
  }, [state]);

  const production = useMemo(() => calculateProduction(state), [state]);

  function run(update: (current: GameState) => GameState) {
    setState((current) => update(current));
  }

  function runAtCurrentTime(update: (current: GameState, timestamp: number) => GameState) {
    const timestamp = Date.now();
    const current = latestStateRef.current;
    const next = update(current, timestamp);
    const bubbles = buildGainBubbleLabels(diffResources(current.resources, next.resources)).map(
      (label, index) => ({
        id: `${timestamp}-${index}-${label}`,
        label,
      }),
    );

    setNow(timestamp);
    latestStateRef.current = next;
    setState(next);

    if (bubbles.length > 0) {
      setGainBubbles((visible) => [...visible, ...bubbles]);
      window.setTimeout(() => {
        setGainBubbles((visible) =>
          visible.filter((bubble) => !bubbles.some((created) => created.id === bubble.id)),
        );
      }, 900);
    }

    const nextReaction = getSceneReaction(current.resources, next.resources);
    if (nextReaction) {
      setSceneReaction(nextReaction);
      window.setTimeout(() => setSceneReaction(null), 700);
    }
  }

  function handleNewGame() {
    const timestamp = Date.now();
    setNow(timestamp);
    const next = createInitialGameState(timestamp);
    latestStateRef.current = next;
    setState(next);
    setGainBubbles([]);
  }

  function handleLoad() {
    const loaded = loadGame();
    if (loaded) {
      latestStateRef.current = loaded;
      setState(loaded);
      setNow(Date.now());
      setGainBubbles([]);
    }
  }

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center p-4">
        <div className="paper-note bg-[var(--yellow)]">
          <p className="handwritten">Le stagiaire virtuel cherche les clés du bureau…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 p-4">
        <OfficeView
          state={state}
          production={production}
          now={now}
          gainBubbles={gainBubbles}
          sceneReaction={sceneReaction}
          onNewGame={handleNewGame}
          onSave={() => saveGame(state)}
          onLoad={handleLoad}
          onBuyWorker={(workerId) =>
            runAtCurrentTime((current, timestamp) => buyWorker(current, workerId, timestamp))
          }
          onUpgradeWorker={(workerId) =>
            runAtCurrentTime((current, timestamp) => upgradeWorker(current, workerId, timestamp))
          }
          onBuyOrUpgradeLocation={(locationId) =>
            runAtCurrentTime((current, timestamp) =>
              buyOrUpgradeLocation(current, locationId, timestamp),
            )
          }
          onUnlockSkill={(skillId) =>
            runAtCurrentTime((current, timestamp) => unlockSkill(current, skillId, timestamp))
          }
          onUseManualAction={(actionId) =>
            runAtCurrentTime((current, timestamp) =>
              performManualAction(current, actionId, timestamp),
            )
          }
          onResolveIncident={(incidentId, choiceId) =>
            runAtCurrentTime((current, timestamp) =>
              resolveIncidentChoice(current, incidentId, choiceId, Math.random, timestamp),
            )
          }
        />
      </main>

      {state.completed && !state.sandboxMode && (
        <div className="overlay">
          <div className="paper-card max-w-lg bg-white p-6 text-center">
            <GameAssetImage assetId="badge-trophy" alt="" className="completion-asset" />
            <h2 className="mt-3 text-3xl font-black">Office Village complet</h2>
            <p className="handwritten mt-3">
              Ton bureau tourne tout seul. Le comité n’a rien compris, donc il valide.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                className="paper-button bg-[var(--mint)]"
                onClick={() => run((current) => continueInSandbox(current))}
              >
                Continuer en sandbox
              </button>
              <button type="button" className="paper-button bg-[var(--yellow)]" onClick={handleNewGame}>
                Nouvelle partie
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
