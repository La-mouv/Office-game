"use client";

import { useState } from "react";
import { AchievementsView } from "@/components/incremental/AchievementsView";
import { GameAssetImage } from "@/components/incremental/GameAssetImage";
import {
  GAME_COPY,
  LANGUAGE_OPTIONS,
  type GameLanguage,
} from "@/lib/gameTranslations";
import type { GameState } from "@/types/incremental";

export function OfficeTopControls({
  state,
  language = "fr",
  onLanguageChange,
  onNewGame,
  onSave,
  onLoad,
  initialMenuOpen = false,
}: {
  state: GameState;
  language?: GameLanguage;
  onLanguageChange?: (language: GameLanguage) => void;
  onNewGame: () => void;
  onSave: () => void;
  onLoad: () => void;
  initialMenuOpen?: boolean;
}) {
  const copy = GAME_COPY[language];
  const [menuOpen, setMenuOpen] = useState(initialMenuOpen);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const ownedLocations = state.locations.filter((location) => location.owned).length;
  const totalWorkers = state.workers.reduce((total, worker) => total + worker.count, 0);
  const activeSynergies = state.synergies.filter((synergy) => synergy.discovered).length;

  function handleLanguageChange(nextLanguage: GameLanguage) {
    onLanguageChange?.(nextLanguage);
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
          {copy.ui.achievements}
        </button>
        <button type="button" className="paper-button bg-white" onClick={() => setMenuOpen(true)}>
          ☰ {copy.ui.menu}
        </button>
      </div>

      {achievementsOpen && (
        <div className="overlay">
          <section
            role="dialog"
            aria-modal="true"
            aria-label={copy.ui.achievementsDialog}
            className="paper-card modal-sheet max-h-[min(80vh,52rem)] w-[min(60rem,calc(100vw-2rem))] overflow-auto bg-white p-4"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">{copy.ui.achievements}</h2>
              <button
                type="button"
                aria-label={copy.ui.close}
                className="paper-button h-10 w-10 bg-white p-0"
                onClick={() => setAchievementsOpen(false)}
              >
                ×
              </button>
            </div>
            <AchievementsView state={state} language={language} />
          </section>
        </div>
      )}

      {menuOpen && (
        <div className="overlay">
          <section
            role="dialog"
            aria-modal="true"
            aria-label={copy.ui.menu}
            className="paper-card modal-sheet w-[min(22rem,calc(100vw-2rem))] space-y-3 bg-white p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">{copy.ui.menu}</h2>
              <button
                type="button"
                aria-label={copy.ui.close}
                className="paper-button h-10 w-10 bg-white p-0"
                onClick={() => setMenuOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="paper-note surface-quiet space-y-2">
              <h3 className="font-black">{copy.ui.overview}</h3>
              <p className="overview-line">
                <GameAssetImage assetId="worker-intern" alt="" className="overview-asset-icon" />
                {copy.ui.colleagues} : {totalWorkers}
              </p>
              <p className="overview-line">
                <GameAssetImage
                  assetId="location-starting-office"
                  alt=""
                  className="overview-asset-icon"
                />
                {copy.ui.locations} : {ownedLocations}
              </p>
              <p className="overview-line">
                <GameAssetImage assetId="badge-gem" alt="" className="overview-asset-icon" />
                {copy.ui.combos} : {activeSynergies}
              </p>
              <p className="overview-line">
                <GameAssetImage assetId="badge-trophy" alt="" className="overview-asset-icon" />
                {copy.ui.objective} : {state.completed ? copy.ui.objectiveDone : copy.ui.objectiveInProgress}
              </p>
            </div>

            <div className="paper-note surface-quiet space-y-2 bg-[var(--yellow-soft)]">
              <h3 className="font-black">{copy.ui.goldenRuleTitle}</h3>
              <p className="handwritten text-sm">{copy.ui.goldenRule}</p>
            </div>

            <div className="paper-note surface-quiet space-y-3">
              <div>
                <h3 className="font-black">{copy.ui.languageTitle}</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {LANGUAGE_OPTIONS.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    aria-label={option.label}
                    aria-pressed={language === option.code}
                    title={option.label}
                    className={`paper-button justify-center px-2 py-2 text-lg leading-none ${
                      language === option.code ? "bg-[var(--yellow)]" : "bg-white"
                    }`}
                    onClick={() => handleLanguageChange(option.code)}
                  >
                    <span aria-hidden="true">{option.flag}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <button type="button" className="paper-button bg-white" onClick={onSave}>
                <GameAssetImage assetId="ui-check" alt="" className="button-asset-icon" />
                {copy.ui.save}
              </button>
              <button type="button" className="paper-button bg-white" onClick={onLoad}>
                <GameAssetImage assetId="badge-confetti" alt="" className="button-asset-icon" />
                {copy.ui.load}
              </button>
              <button type="button" className="paper-button bg-[var(--pink)]" onClick={onNewGame}>
                <GameAssetImage assetId="badge-starburst" alt="" className="button-asset-icon" />
                {copy.ui.newGame}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
