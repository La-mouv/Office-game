"use client";

import { useEffect, useState } from "react";
import { AchievementsView } from "@/components/incremental/AchievementsView";
import { GameAssetImage } from "@/components/incremental/GameAssetImage";
import type { GameState } from "@/types/incremental";

type GameLanguage = "fr" | "en" | "es";

const LANGUAGE_STORAGE_KEY = "office-village-language";
const LANGUAGE_OPTIONS: { code: GameLanguage; label: string }[] = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

function isGameLanguage(value: string | null): value is GameLanguage {
  return value === "fr" || value === "en" || value === "es";
}

export function OfficeTopControls({
  state,
  onNewGame,
  onSave,
  onLoad,
  initialMenuOpen = false,
}: {
  state: GameState;
  onNewGame: () => void;
  onSave: () => void;
  onLoad: () => void;
  initialMenuOpen?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(initialMenuOpen);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [language, setLanguage] = useState<GameLanguage>("fr");
  const ownedLocations = state.locations.filter((location) => location.owned).length;
  const totalWorkers = state.workers.reduce((total, worker) => total + worker.count, 0);
  const activeSynergies = state.synergies.filter((synergy) => synergy.discovered).length;

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isGameLanguage(storedLanguage)) {
      setLanguage(storedLanguage);
    }
  }, []);

  function handleLanguageChange(nextLanguage: GameLanguage) {
    setLanguage(nextLanguage);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }

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

            <div className="paper-note surface-quiet space-y-3">
              <div>
                <h3 className="font-black">Langue</h3>
                <p className="handwritten text-sm">
                  Choisis la langue du jeu. La traduction complète arrive juste après.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {LANGUAGE_OPTIONS.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    aria-pressed={language === option.code}
                    className={`paper-button justify-center px-2 py-2 text-sm ${
                      language === option.code ? "bg-[var(--yellow)]" : "bg-white"
                    }`}
                    onClick={() => handleLanguageChange(option.code)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
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
