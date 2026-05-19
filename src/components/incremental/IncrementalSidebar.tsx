"use client";

import { useState } from "react";
import type { GameState } from "@/types/incremental";

export type IncrementalView = "office" | "upgrades" | "achievements";

const VIEWS: { id: IncrementalView; label: string; emoji: string }[] = [
  { id: "office", label: "Bureau", emoji: "🏢" },
  { id: "upgrades", label: "Upgrades", emoji: "⬆️" },
  { id: "achievements", label: "Réussites", emoji: "🏅" },
];

export function IncrementalSidebar({
  activeView,
  state,
  onViewChange,
  onNewGame,
  onSave,
  onLoad,
}: {
  activeView: IncrementalView;
  state: GameState;
  onViewChange: (view: IncrementalView) => void;
  onNewGame: () => void;
  onSave: () => void;
  onLoad: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ownedLocations = state.locations.filter((location) => location.owned).length;
  const totalWorkers = state.workers.reduce((total, worker) => total + worker.count, 0);
  const activeSynergies = state.synergies.filter((synergy) => synergy.discovered).length;

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
            <span>{view.emoji}</span>
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
              <h3 className="font-black">Vue d’ensemble</h3>
              <p>👥 Collègues : {totalWorkers}</p>
              <p>🏗️ Lieux : {ownedLocations}</p>
              <p>🔗 Synergies : {activeSynergies}</p>
              <p>🏁 Objectif : {state.completed ? "atteint" : "en cours"}</p>
            </div>

            <div className="paper-note surface-quiet space-y-2 bg-[var(--yellow-soft)]">
              <h3 className="font-black">Règle d’or</h3>
              <p className="handwritten text-sm">
                Le bureau peut partir en vrille, mais il continue de produire.
              </p>
            </div>

            <div className="grid gap-2">
              <button type="button" className="paper-button bg-white" onClick={onSave}>
                💾 Sauvegarder
              </button>
              <button type="button" className="paper-button bg-white" onClick={onLoad}>
                📂 Charger
              </button>
              <button type="button" className="paper-button bg-[var(--pink)]" onClick={onNewGame}>
                🔄 Nouvelle partie
              </button>
            </div>
          </section>
        </div>
      )}
    </aside>
  );
}
