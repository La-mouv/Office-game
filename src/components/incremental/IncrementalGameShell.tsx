"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EndScreen } from "@/components/incremental/EndScreen";
import { GameAssetImage } from "@/components/incremental/GameAssetImage";
import { OfficeView } from "@/components/incremental/OfficeView";
import { WelcomeScreen } from "@/components/incremental/WelcomeScreen";
import {
  buyOrUpgradeLocation,
  buyWorker,
  calculateProduction,
  createInitialGameState,
  gameTick,
  getRunElapsedMs,
  resumeRunTimer,
  resolveIncidentChoice,
  unlockSkill,
  upgradeWorker,
  useManualAction as performManualAction,
} from "@/lib/incrementalGame";
import { loadGame, saveGame } from "@/lib/incrementalStorage";
import { getCopy, localizeGameState } from "@/lib/gameTranslations";
import {
  buildLeaderboardRunId,
  buildLeaderboardUrl,
  OFFICE_VILLAGE_GAME_ID,
  type LeaderboardEntry,
  type LeaderboardPlayerRegistrationResult,
  type LeaderboardResponse,
  type LeaderboardSubmissionResult,
} from "@/lib/leaderboard";
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
const PLAYER_TOKEN_STORAGE_KEY = "office-village-player-token";
const TUTORIAL_SEEN_STORAGE_KEY = "office-village-tutorial-seen";
const LEADERBOARD_SUBMITTED_RUNS_STORAGE_KEY = "office-village-leaderboard-submitted-runs";

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
  const [playerToken, setPlayerToken] = useState("");
  const [showNameError, setShowNameError] = useState(false);
  const [playerErrorMessage, setPlayerErrorMessage] = useState<string | null>(null);
  const [playerReservationPending, setPlayerReservationPending] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [leaderboardPlayerEntry, setLeaderboardPlayerEntry] = useState<LeaderboardEntry | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [now, setNow] = useState(0);
  const [state, setState] = useState<GameState>(() => createInitialGameState(0));
  const [gainBubbles, setGainBubbles] = useState<GainBubble[]>([]);
  const [sceneReaction, setSceneReaction] = useState<SceneReaction>(null);
  const latestStateRef = useRef(state);
  const submittedLeaderboardRunsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const timestamp = Date.now();
      const loaded = loadGame();
      let storedPlayerName = "";
      let storedPlayerToken = "";
      let storedTutorialSeen = false;
      let storedSubmittedLeaderboardRuns: string[] = [];

      try {
        storedPlayerName = window.localStorage.getItem(PLAYER_NAME_STORAGE_KEY) ?? "";
        storedPlayerToken = window.localStorage.getItem(PLAYER_TOKEN_STORAGE_KEY) ?? "";
        storedTutorialSeen = window.localStorage.getItem(TUTORIAL_SEEN_STORAGE_KEY) === "true";
        storedSubmittedLeaderboardRuns = JSON.parse(
          window.localStorage.getItem(LEADERBOARD_SUBMITTED_RUNS_STORAGE_KEY) ?? "[]",
        );
      } catch {
        storedPlayerName = "";
        storedPlayerToken = "";
        storedTutorialSeen = false;
        storedSubmittedLeaderboardRuns = [];
      }

      submittedLeaderboardRunsRef.current = new Set(
        storedSubmittedLeaderboardRuns.filter((runId) => typeof runId === "string"),
      );
      setNow(timestamp);
      setState(loaded ?? createInitialGameState(timestamp));
      setPlayerName(storedPlayerName);
      setPlayerToken(storedPlayerToken);
      setTutorialSeen(storedTutorialSeen);
      if (loaded?.completed && !loaded.sandboxMode) {
        setWelcomeVisible(false);
      }
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return undefined;

    const abortController = new AbortController();
    const trimmedName = playerName.trim();
    const runId =
      state.completed && !state.sandboxMode && state.completedAt && trimmedName
        ? buildLeaderboardRunId(trimmedName, state.startedAt, state.completedAt)
        : null;

    fetch(buildLeaderboardUrl(runId, 5), {
      signal: abortController.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: LeaderboardResponse | null) => {
        if (payload?.entries) {
          setLeaderboardEntries(payload.entries);
          setLeaderboardPlayerEntry(payload.playerEntry ?? null);
        }
      })
      .catch(() => {
        // The game remains playable if the public leaderboard is temporarily unavailable.
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setLeaderboardLoading(false);
        }
      });

    return () => abortController.abort();
  }, [hydrated, playerName, state.completed, state.completedAt, state.sandboxMode, state.startedAt]);

  useEffect(() => {
    latestStateRef.current = state;
    if (hydrated) {
      saveGame(state);
    }
  }, [hydrated, state]);

  useEffect(() => {
    if (!hydrated || welcomeVisible || tutorialVisible || state.lost) return undefined;

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
  }, [hydrated, welcomeVisible, tutorialVisible, state.lost]);

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
        lost: state.lost,
      });
    window.advanceTime = (ms: number) => {
      setState((current) => gameTick(current, current.lastTickAt + ms));
      setNow((current) => current + ms);
    };
  }, [state]);

  useEffect(() => {
    const trimmedName = playerName.trim();
    if (
      !hydrated ||
      !state.completed ||
      state.sandboxMode ||
      !state.completedAt ||
      !trimmedName ||
      !playerToken
    ) {
      return;
    }

    const elapsedMs = Math.max(0, state.completedAt - state.startedAt);
    const runId = buildLeaderboardRunId(trimmedName, state.startedAt, state.completedAt);
    if (submittedLeaderboardRunsRef.current.has(runId)) return;

    submittedLeaderboardRunsRef.current.add(runId);

    fetch("/api/leaderboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gameId: OFFICE_VILLAGE_GAME_ID,
        playerName: trimmedName,
        playerToken,
        elapsedMs,
        runId,
      }),
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: LeaderboardSubmissionResult | null) => {
        if (!payload) {
          submittedLeaderboardRunsRef.current.delete(runId);
          return;
        }

        setLeaderboardEntries(payload.entries);
        setLeaderboardPlayerEntry(payload.playerEntry ?? null);
        try {
          window.localStorage.setItem(
            LEADERBOARD_SUBMITTED_RUNS_STORAGE_KEY,
            JSON.stringify([...submittedLeaderboardRunsRef.current]),
          );
        } catch {
          // Duplicate protection still works for the current tab.
        }
      })
      .catch(() => {
        submittedLeaderboardRunsRef.current.delete(runId);
      });
  }, [
    hydrated,
    playerName,
    playerToken,
    state.completed,
    state.completedAt,
    state.sandboxMode,
    state.startedAt,
  ]);

  const production = useMemo(() => calculateProduction(state), [state]);
  const localizedState = useMemo(() => localizeGameState(state, language), [state, language]);

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
    setLeaderboardPlayerEntry(null);
  }

  function handleRestartFromEnd() {
    handleNewGame();
    setWelcomeVisible(true);
    setTutorialVisible(false);
    setTutorialStepIndex(0);
    setShowNameError(false);
  }

  async function reservePlayerName(trimmedName: string): Promise<string | null> {
    setPlayerReservationPending(true);
    try {
      const response = await fetch("/api/leaderboard/player", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId: OFFICE_VILLAGE_GAME_ID,
          playerName: trimmedName,
          ...(playerToken ? { playerToken } : {}),
        }),
      });

      if (response.status === 409) {
        setPlayerErrorMessage(copy.welcome.playerTakenError);
        setShowNameError(true);
        return null;
      }

      if (!response.ok) {
        setPlayerErrorMessage(copy.welcome.playerReserveError);
        setShowNameError(true);
        return null;
      }

      const payload = (await response.json()) as LeaderboardPlayerRegistrationResult;
      setPlayerName(payload.playerName);
      setPlayerToken(payload.playerToken);
      try {
        window.localStorage.setItem(PLAYER_NAME_STORAGE_KEY, payload.playerName);
        window.localStorage.setItem(PLAYER_TOKEN_STORAGE_KEY, payload.playerToken);
      } catch {
        // The run can continue, but this browser may not remember the reserved badge.
      }
      return payload.playerToken;
    } catch {
      setPlayerErrorMessage(copy.welcome.playerReserveError);
      setShowNameError(true);
      return null;
    } finally {
      setPlayerReservationPending(false);
    }
  }

  async function handleStartGame() {
    const trimmedName = playerName.trim();

    if (!trimmedName) {
      setPlayerErrorMessage(null);
      setShowNameError(true);
      return;
    }

    const reservedToken = await reservePlayerName(trimmedName);
    if (!reservedToken) return;

    const timestamp = Date.now();
    try {
      window.localStorage.setItem(PLAYER_NAME_STORAGE_KEY, trimmedName);
      window.localStorage.setItem(PLAYER_TOKEN_STORAGE_KEY, reservedToken);
    } catch {
      // The run can start even if browser storage is blocked.
    }

    setPlayerName(trimmedName);
    setPlayerToken(reservedToken);
    setPlayerErrorMessage(null);
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
        leaderboardEntries={leaderboardEntries}
        leaderboardLoading={leaderboardLoading}
        showNameError={showNameError}
        playerErrorMessage={playerErrorMessage}
        playerLocked={Boolean(playerToken)}
        onPlayerNameChange={(value) => {
          if (playerToken) return;
          setPlayerName(value);
          if (showNameError && value.trim()) {
            setShowNameError(false);
            setPlayerErrorMessage(null);
          }
        }}
        onLanguageChange={setStoredGameLanguage}
        onStart={handleStartGame}
        startDisabled={playerReservationPending}
      />
    );
  }

  if (state.completed && !state.sandboxMode) {
    return (
      <EndScreen
        copy={copy}
        language={language}
        playerName={playerName.trim()}
        elapsedMs={getRunElapsedMs(state, now)}
        playerEntry={leaderboardPlayerEntry}
        leaderboardEntries={leaderboardEntries}
        leaderboardLoading={leaderboardLoading}
        onRestart={handleRestartFromEnd}
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

      {state.lost && (
        <div className="overlay">
          <div className="paper-card max-w-lg bg-white p-6 text-center">
            <GameAssetImage assetId="resource-chaos" alt="" className="completion-asset" />
            <h2 className="mt-3 text-3xl font-black">{copy.ui.lossTitle}</h2>
            <p className="handwritten mt-3">{copy.ui.lossBody}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
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
