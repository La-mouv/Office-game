"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GameAssetImage } from "@/components/incremental/GameAssetImage";
import { OfficeView } from "@/components/incremental/OfficeView";
import { WelcomeScreen } from "@/components/incremental/WelcomeScreen";
import {
  buyOrUpgradeLocation,
  buyWorker,
  calculateProduction,
  continueInSandbox,
  createInitialGameState,
  gameTick,
  resumeRunTimer,
  resolveIncidentChoice,
  unlockSkill,
  upgradeWorker,
  useManualAction as performManualAction,
} from "@/lib/incrementalGame";
import { loadGame, saveGame } from "@/lib/incrementalStorage";
import { getCopy, localizeGameState } from "@/lib/gameTranslations";
import { setStoredGameLanguage, useGameLanguage } from "@/lib/useGameLanguage";
import {
  buildGainBubbleLabels,
  diffResources,
  getSceneReaction,
  type GainBubble,
  type SceneReaction,
} from "@/lib/incrementalPresentation";
import type { GameState } from "@/types/incremental";

const PLAYER_NAME_STORAGE_KEY = "office-village-player-name";
const TUTORIAL_SEEN_STORAGE_KEY = "office-village-tutorial-seen";

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (ms: number) => void;
  }
}

export function IncrementalGameShell() {
  const language = useGameLanguage();
  const copy = getCopy(language);
  const [hydrated, setHydrated] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(true);
  const [tutorialVisible, setTutorialVisible] = useState(false);
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);
  const [tutorialSeen, setTutorialSeen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [showNameError, setShowNameError] = useState(false);
  const [now, setNow] = useState(0);
  const [state, setState] = useState<GameState>(() => createInitialGameState(0));
  const [gainBubbles, setGainBubbles] = useState<GainBubble[]>([]);
  const [sceneReaction, setSceneReaction] = useState<SceneReaction>(null);
  const latestStateRef = useRef(state);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const timestamp = Date.now();
      const loaded = loadGame();
      let storedPlayerName = "";
      let storedTutorialSeen = false;

      try {
        storedPlayerName = window.localStorage.getItem(PLAYER_NAME_STORAGE_KEY) ?? "";
        storedTutorialSeen = window.localStorage.getItem(TUTORIAL_SEEN_STORAGE_KEY) === "true";
      } catch {
        storedPlayerName = "";
        storedTutorialSeen = false;
      }

      setNow(timestamp);
      setState(loaded ?? createInitialGameState(timestamp));
      setPlayerName(storedPlayerName);
      setTutorialSeen(storedTutorialSeen);
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
    if (!hydrated || welcomeVisible || tutorialVisible) return undefined;

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
  }, [hydrated, welcomeVisible, tutorialVisible]);

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
  const localizedState = useMemo(() => localizeGameState(state, language), [state, language]);

  function run(update: (current: GameState) => GameState) {
    setState((current) => update(current));
  }

  function runAtCurrentTime(update: (current: GameState, timestamp: number) => GameState) {
    const timestamp = Date.now();
    const current = latestStateRef.current;
    const next = update(current, timestamp);
    const bubbles = buildGainBubbleLabels(diffResources(current.resources, next.resources), language).map(
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

  function handleStartGame() {
    const trimmedName = playerName.trim();

    if (!trimmedName) {
      setShowNameError(true);
      return;
    }

    const timestamp = Date.now();
    try {
      window.localStorage.setItem(PLAYER_NAME_STORAGE_KEY, trimmedName);
    } catch {
      // The run can start even if browser storage is blocked.
    }

    setPlayerName(trimmedName);
    setShowNameError(false);
    setWelcomeVisible(false);
    if (!tutorialSeen) {
      setTutorialStepIndex(0);
      setTutorialVisible(true);
    }
    setNow(timestamp);
    setState((current) => {
      const next = resumeRunTimer(current, timestamp);
      latestStateRef.current = next;
      return next;
    });
  }

  function markTutorialSeen() {
    setTutorialSeen(true);
    try {
      window.localStorage.setItem(TUTORIAL_SEEN_STORAGE_KEY, "true");
    } catch {
      // The tutorial can still close if browser storage is blocked.
    }
  }

  function resumeAfterTutorial() {
    const timestamp = Date.now();
    setNow(timestamp);
    setState((current) => {
      const next = resumeRunTimer(current, timestamp);
      latestStateRef.current = next;
      return next;
    });
  }

  function closeTutorial() {
    markTutorialSeen();
    setTutorialVisible(false);
    setTutorialStepIndex(0);
    resumeAfterTutorial();
  }

  function handleTutorialNext() {
    if (tutorialStepIndex >= copy.tutorial.steps.length - 1) {
      closeTutorial();
      return;
    }

    setTutorialStepIndex((current) => Math.min(current + 1, copy.tutorial.steps.length - 1));
  }

  function handleOpenTutorial() {
    setTutorialStepIndex(0);
    setTutorialVisible(true);
  }

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center p-4">
        <div className="paper-note bg-[var(--yellow)]">
          <p className="handwritten">{copy.ui.loading}</p>
        </div>
      </div>
    );
  }

  if (welcomeVisible) {
    return (
      <WelcomeScreen
        copy={copy.welcome}
        language={language}
        playerName={playerName}
        showNameError={showNameError}
        onPlayerNameChange={(value) => {
          setPlayerName(value);
          if (showNameError && value.trim()) {
            setShowNameError(false);
          }
        }}
        onLanguageChange={setStoredGameLanguage}
        onStart={handleStartGame}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 p-4">
        <OfficeView
          language={language}
          state={localizedState}
          production={production}
          now={now}
          gainBubbles={gainBubbles}
          sceneReaction={sceneReaction}
          onNewGame={handleNewGame}
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
          onLanguageChange={setStoredGameLanguage}
          tutorialVisible={tutorialVisible}
          tutorialStepIndex={tutorialStepIndex}
          onTutorialNext={handleTutorialNext}
          onTutorialSkip={closeTutorial}
          onOpenTutorial={handleOpenTutorial}
        />
      </main>

      {state.completed && !state.sandboxMode && (
        <div className="overlay">
          <div className="paper-card max-w-lg bg-white p-6 text-center">
            <GameAssetImage assetId="badge-trophy" alt="" className="completion-asset" />
            <h2 className="mt-3 text-3xl font-black">{copy.ui.completionTitle}</h2>
            <p className="handwritten mt-3">{copy.ui.completionBody}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                className="paper-button bg-[var(--mint)]"
                onClick={() => run((current) => continueInSandbox(current))}
              >
                {copy.ui.keepPlaying}
              </button>
              <button type="button" className="paper-button bg-[var(--yellow)]" onClick={handleNewGame}>
                {copy.ui.restart}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
