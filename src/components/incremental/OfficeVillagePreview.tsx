"use client";

import { useState } from "react";
import { IncrementalResourceBar } from "@/components/incremental/IncrementalResourceBar";
import { GameAssetImage } from "@/components/incremental/GameAssetImage";
import { LocationCard } from "@/components/incremental/LocationCard";
import { ManualActionsPanel } from "@/components/incremental/ManualActionsPanel";
import { WorkerCard } from "@/components/incremental/WorkerCard";
import { formatResourceEffect } from "@/lib/incrementalUi";
import { getCopy, type GameLanguage } from "@/lib/gameTranslations";
import { getIncidentAssetId } from "@/lib/incrementalAssets";
import { type GainBubble } from "@/lib/incrementalPresentation";
import type { GameState, ProductionSummary } from "@/types/incremental";

export function OfficeVillagePreview({
  language = "fr",
  state,
  production,
  now,
  gainBubbles,
  sceneReaction,
  onNewGame,
  onBuyWorker,
  onUpgradeWorker,
  onBuyOrUpgradeLocation,
  onUseManualAction,
  onResolveIncident,
  onLanguageChange,
}: {
  language?: GameLanguage;
  state: GameState;
  production: ProductionSummary;
  now: number;
  gainBubbles: GainBubble[];
  sceneReaction: "ambiance" | "chaos" | null;
  onNewGame: () => void;
  onSave?: () => void;
  onLoad?: () => void;
  onBuyWorker: (workerId: string) => void;
  onUpgradeWorker: (workerId: string) => void;
  onBuyOrUpgradeLocation: (locationId: string) => void;
  onUseManualAction: (actionId: string) => void;
  onResolveIncident: (incidentId: string, choiceId: string) => void;
  onLanguageChange?: (language: GameLanguage) => void;
}) {
  const copy = getCopy(language);
  const [incidentOpen, setIncidentOpen] = useState(false);
  const ownedLocations = state.locations.filter((location) => location.owned);
  const activeWorkers = state.workers.filter((worker) => worker.count > 0);
  const incidentButton = (
    <button
      type="button"
      className={`office-scene-chip incident-button ${
        state.activeIncident ? "incident-alert-chip" : "office-scene-chip-muted"
      }`}
      onClick={() => state.activeIncident && setIncidentOpen(true)}
      disabled={!state.activeIncident}
    >
      <span className="incident-alarm-icon" aria-hidden="true">
        <span className="incident-alarm-glow" />
      </span>
      {copy.ui.incidentTitle}
    </button>
  );

  return (
    <section
      className={`office-scene office-breathe ${
        sceneReaction === "ambiance" ? "office-scene-ambiance" : ""
      } ${sceneReaction === "chaos" ? "office-scene-chaos" : ""}`}
    >
      <div className="office-scene-gains">
        {gainBubbles.map((bubble) => (
          <span key={bubble.id} className="gain-pop paper-pill bg-[var(--yellow)] text-sm font-black">
            {bubble.label}
          </span>
        ))}
      </div>

      <IncrementalResourceBar
        state={state}
        language={language}
        production={production}
        onNewGame={onNewGame}
        onLanguageChange={onLanguageChange}
        incidentControl={incidentButton}
      />

      <div className="office-floor">
        <div className="office-board-grid">
          {ownedLocations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              reputation={state.resources.reputation}
              budget={state.resources.budget}
              onBuyOrUpgrade={() => onBuyOrUpgradeLocation(location.id)}
              variant="office"
              language={language}
            />
          ))}

          {activeWorkers.map((worker) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              reputation={state.resources.reputation}
              budget={state.resources.budget}
              onBuy={() => onBuyWorker(worker.id)}
              onUpgrade={() => onUpgradeWorker(worker.id)}
              variant="office"
              language={language}
            />
          ))}
        </div>
      </div>

      <ManualActionsPanel
        actions={state.manualActions}
        resources={state.resources}
        locations={state.locations}
        now={now}
        onUse={onUseManualAction}
        variant="scene"
        language={language}
      />

      {incidentOpen && state.activeIncident && (
        <div className="office-scene-modal-backdrop">
          <section
            role="dialog"
            aria-modal="true"
            aria-label={copy.ui.activeIncident}
            className="paper-card office-scene-modal incident-scene-modal"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide">{copy.ui.activeIncident}</p>
                <h3 className="incident-title-with-asset mt-1 text-xl font-black">
                  <GameAssetImage
                    assetId={getIncidentAssetId(state.activeIncident.id)}
                    alt=""
                    className="incident-title-asset"
                  />
                  {state.activeIncident.title}
                </h3>
              </div>
              <button
                type="button"
                aria-label={copy.ui.close}
                className="paper-button h-10 w-10 bg-white p-0"
                onClick={() => setIncidentOpen(false)}
              >
                ×
              </button>
            </div>

            <p className="handwritten mt-3">{state.activeIncident.description}</p>
            <div className="mt-4 grid gap-2">
              {state.activeIncident.choices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  className="decision-button"
                  onClick={() => {
                    onResolveIncident(state.activeIncident!.id, choice.id);
                    setIncidentOpen(false);
                  }}
                >
                  <span>{choice.label}</span>
                  <span className="text-xs opacity-70">
                    {choice.chance ? copy.ui.unknownEffect : formatResourceEffect(choice.effect, language)}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
