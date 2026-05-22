"use client";

import { useState } from "react";
import { AchievementsView } from "@/components/incremental/AchievementsView";
import { GameAssetImage } from "@/components/incremental/GameAssetImage";
import type { GameState } from "@/types/incremental";

export function OfficeTopControls({
  state,
  onNewGame,
  onSave,
  onLoad,
}: {
  state: GameState;
  onNewGame: () => void;
  onSave: () => void;
  onLoad: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const ownedLocations = state.locations.filter((location) => location.owned).length;
  const totalWorkers = state.workers.reduce((total, worker) => total + worker.count, 0);
  const activeSynergies = state.synergies.filter((synergy) => synergy.discovered).length;

  return (
    <>
      <div className="office-top-controls">
        <button
          type="button"
          className="paper-button bg-white"
          onClick={() => setAchievementsOpen(true)}
        >
          <GameAssetImage assetId="badge-medal" alt="" className="button-asset-icon" />
          Réussites
        </button>
        <button type="button" className="paper-button bg-white" onClick={() => setMenuOpen(true)}>
          ☰ Menu
        </button>
      </div>

      {achievementsOpen && (
        <div className="overlay">
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Réussites"
            className="paper-card modal-sheet max-h-[min(80vh,52rem)] w-[min(60rem,calc(100vw-2rem))] overflow-auto bg-white p-4"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">Réussites</h2>
              <button
                type="button"
                aria-label="Fermer"
                className="paper-button h-10 w-10 bg-white p-0"
                onClick={() => setAchievementsOpen(false)}
              >
                ×
              </button>
            </div>
            <AchievementsView state={state} />
          </section>
        </div>
      )}

      {menuOpen && (
        <div className="overlay">
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="paper-card modal-sheet w-[min(22rem,calc(100vw-2rem))] space-y-3 bg-white p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">Menu</h2>
              <button
                type="button"
                aria-label="Fermer"
                className="paper-button h-10 w-10 bg-white p-0"
                onClick={() => setMenuOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="paper-note surface-quiet space-y-2">
              <h3 className="font-black">Vue d’ensemble</h3>
              <p className="overview-line">
                <GameAssetImage assetId="worker-intern" alt="" className="overview-asset-icon" />
                Collègues : {totalWorkers}
              </p>
              <p className="overview-line">
                <GameAssetImage
                  assetId="location-starting-office"
                  alt=""
                  className="overview-asset-icon"
                />
                Lieux : {ownedLocations}
              </p>
              <p className="overview-line">
                <GameAssetImage assetId="badge-gem" alt="" className="overview-asset-icon" />
                Combos : {activeSynergies}
              </p>
              <p className="overview-line">
                <GameAssetImage assetId="badge-trophy" alt="" className="overview-asset-icon" />
                Objectif : {state.completed ? "atteint" : "en cours"}
              </p>
            </div>

            <div className="paper-note surface-quiet space-y-2 bg-[var(--yellow-soft)]">
              <h3 className="font-black">Règle d’or</h3>
              <p className="handwritten text-sm">
                Le bureau peut partir en vrille, mais il continue de produire.
              </p>
            </div>

            <div className="grid gap-2">
              <button type="button" className="paper-button bg-white" onClick={onSave}>
                <GameAssetImage assetId="ui-check" alt="" className="button-asset-icon" />
                Sauvegarder
              </button>
              <button type="button" className="paper-button bg-white" onClick={onLoad}>
                <GameAssetImage assetId="badge-confetti" alt="" className="button-asset-icon" />
                Charger
              </button>
              <button type="button" className="paper-button bg-[var(--pink)]" onClick={onNewGame}>
                <GameAssetImage assetId="badge-starburst" alt="" className="button-asset-icon" />
                Nouvelle partie
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
