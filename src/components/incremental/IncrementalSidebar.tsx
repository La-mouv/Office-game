"use client";

import { useState } from "react";
import { GameAssetImage } from "@/components/incremental/GameAssetImage";
import type { GameAssetId } from "@/lib/gameAssets";
import type { GameState } from "@/types/incremental";

export type IncrementalView = "office" | "upgrades" | "achievements";

const VIEWS: { id: IncrementalView; label: string; assetId: GameAssetId }[] = [
  { id: "office", label: "Bureau", assetId: "location-starting-office" },
  { id: "upgrades", label: "Talents", assetId: "icon-plus" },
  { id: "achievements", label: "Réussites", assetId: "badge-medal" },
];

export function IncrementalSidebar({
  activeView,
  state,
  onViewChange,
  onNewGame,
  initialMenuOpen = false,
  initialNewGameConfirmOpen = false,
}: {
  activeView: IncrementalView;
  state: GameState;
  onViewChange: (view: IncrementalView) => void;
  onNewGame: () => void;
  onSave?: () => void;
  onLoad?: () => void;
  initialMenuOpen?: boolean;
  initialNewGameConfirmOpen?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(initialMenuOpen);
  const [newGameConfirmOpen, setNewGameConfirmOpen] = useState(initialNewGameConfirmOpen);
  const ownedLocations = state.locations.filter((location) => location.owned).length;
  const totalWorkers = state.workers.reduce((total, worker) => total + worker.count, 0);
  const activeSynergies = state.synergies.filter((synergy) => synergy.discovered).length;

  function handleConfirmNewGame() {
    onNewGame();
    setNewGameConfirmOpen(false);
    setMenuOpen(false);
  }

  return (
    <aside className="office-sidebar">
      <p className="sidebar-label">Navigation</p>

      <nav className="grid gap-2">
        {VIEWS.map((view) => (
          <button
            key={view.id}
            type="button"
            onClick={() => onViewChange(view.id)}
            className={`paper-button justify-start ${
              activeView === view.id ? "bg-[var(--yellow)]" : "bg-white"
            }`}
          >
            <GameAssetImage assetId={view.assetId} alt="" className="button-asset-icon" />
            {view.label}
          </button>
        ))}
      </nav>

      <button
        type="button"
        className="paper-button mt-auto justify-start bg-white"
        onClick={() => setMenuOpen(true)}
      >
        ☰ Menu
      </button>

      {menuOpen && (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            aria-label="Fermer le menu"
            className="absolute inset-0 bg-black/20"
            onClick={() => setMenuOpen(false)}
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="paper-card absolute bottom-4 left-4 z-10 w-[min(22rem,calc(100vw-2rem))] space-y-3 bg-white p-4"
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
              <h3 className="font-black">Tableau de bord improvisé</h3>
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
                Objectif : {state.completed ? "sauvé" : "en chantier"}
              </p>
            </div>

            <div className="paper-note surface-quiet space-y-2 bg-[var(--yellow-soft)]">
              <h3 className="font-black">Règle d’or</h3>
              <p className="handwritten text-sm">
                Le bureau peut partir en vrille, tant qu’il continue de produire quelque chose de présentable.
              </p>
            </div>

            <div className="paper-note surface-quiet bg-[var(--mint)] py-3">
              <p className="overview-line text-sm font-black">
                <GameAssetImage assetId="ui-check" alt="" className="overview-asset-icon" />
                Sauvegarde automatique active
              </p>
            </div>

            <div className="grid gap-2">
              <button
                type="button"
                className="paper-button bg-[var(--pink)]"
                onClick={() => setNewGameConfirmOpen(true)}
              >
                <GameAssetImage assetId="badge-starburst" alt="" className="button-asset-icon" />
                Nouvelle partie
              </button>

              {newGameConfirmOpen && (
                <div className="paper-note surface-quiet space-y-3 bg-[var(--pink)]">
                  <div>
                    <h3 className="font-black">Nouvelle partie ?</h3>
                    <p className="handwritten text-sm">Ça remet la progression à zéro.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className="paper-button bg-white px-3"
                      onClick={() => setNewGameConfirmOpen(false)}
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      className="paper-button bg-[var(--yellow)] px-3"
                      onClick={handleConfirmNewGame}
                    >
                      Recommencer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </aside>
  );
}
