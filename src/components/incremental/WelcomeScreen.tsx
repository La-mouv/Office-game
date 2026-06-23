"use client";

import Image from "next/image";
import { useState } from "react";
import {
  LANGUAGE_OPTIONS,
  type GameLanguage,
  type WelcomeCopy,
} from "@/lib/gameTranslations";
import { formatLeaderboardTime, type LeaderboardEntry } from "@/lib/leaderboard";

const WELCOME_LEADERBOARD_COMPACT_LIMIT = 3;

export function WelcomeScreen({
  copy,
  language,
  playerName,
  leaderboardEntries = [],
  leaderboardLoading = false,
  showNameError,
  playerErrorMessage,
  playerLocked = false,
  startDisabled = false,
  initialLeaderboardExpanded = false,
  onPlayerNameChange,
  onLanguageChange,
  onStart,
}: {
  copy: WelcomeCopy;
  language: GameLanguage;
  playerName: string;
  leaderboardEntries?: LeaderboardEntry[];
  leaderboardLoading?: boolean;
  showNameError: boolean;
  playerErrorMessage?: string | null;
  playerLocked?: boolean;
  startDisabled?: boolean;
  initialLeaderboardExpanded?: boolean;
  onPlayerNameChange: (value: string) => void;
  onLanguageChange: (language: GameLanguage) => void;
  onStart: () => void;
}) {
  const [leaderboardExpanded, setLeaderboardExpanded] = useState(initialLeaderboardExpanded);
  const hasExpandableLeaderboard = leaderboardEntries.length > WELCOME_LEADERBOARD_COMPACT_LIMIT;
  const visibleLeaderboardEntries = leaderboardExpanded
    ? leaderboardEntries
    : leaderboardEntries.slice(0, WELCOME_LEADERBOARD_COMPACT_LIMIT);
  const leaderboardToggleLabel = leaderboardExpanded
    ? copy.leaderboardShowTop(WELCOME_LEADERBOARD_COMPACT_LIMIT)
    : copy.leaderboardShowAll;

  return (
    <main className="welcome-screen">
      <Image
        src="/game-assets/office-village-cover.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="welcome-cover-image"
      />

      <div className="welcome-content">
        <section className="welcome-brand" aria-label={copy.title}>
          <p className="welcome-eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="welcome-subtitle">{copy.subtitle}</p>
        </section>

        <section className="welcome-panel" aria-label={copy.start}>
          <form
            className="welcome-form"
            onSubmit={(event) => {
              event.preventDefault();
              onStart();
            }}
          >
            <label htmlFor="player-name">{copy.playerLabel}</label>
            <input
              id="player-name"
              type="text"
              value={playerName}
              onChange={(event) => onPlayerNameChange(event.target.value)}
              placeholder={copy.playerPlaceholder}
              maxLength={20}
              autoComplete="nickname"
              readOnly={playerLocked}
            />
            {showNameError && (
              <p className="welcome-error" role="alert">
                {playerErrorMessage ?? copy.playerError}
              </p>
            )}

            <div className="welcome-language-row" aria-label={copy.language}>
              <span>{copy.language}</span>
              <div className="welcome-language-buttons">
                {LANGUAGE_OPTIONS.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    aria-label={option.label}
                    aria-pressed={language === option.code}
                    title={option.label}
                    className={language === option.code ? "welcome-language-active" : ""}
                    onClick={() => onLanguageChange(option.code)}
                  >
                    <span aria-hidden="true">{option.flag}</span>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="welcome-start-button" disabled={startDisabled}>
              {copy.start}
            </button>
          </form>

          <aside className="welcome-leaderboard" aria-label={copy.leaderboardTitle}>
            <div className="welcome-leaderboard-heading">
              <h2>{copy.leaderboardTitle}</h2>
              <span>{copy.leaderboardBadge}</span>
            </div>
            <ol
              id="welcome-leaderboard-list"
              className={leaderboardExpanded ? "leaderboard-list-expanded" : undefined}
            >
              {visibleLeaderboardEntries.length > 0
                ? visibleLeaderboardEntries.map((entry) => (
                    <li key={`${entry.rank}-${entry.playerName}-${entry.elapsedMs}`}>
                      <strong>#{entry.rank}</strong>
                      <span>{entry.playerName}</span>
                      <em>{formatLeaderboardTime(entry.elapsedMs)}</em>
                    </li>
                  ))
                : [1, 2, 3].map((rank) => (
                    <li key={rank}>
                      <strong>#{rank}</strong>
                      <span>{copy.leaderboardPlaceholder}</span>
                      <em>--:--</em>
                    </li>
                  ))}
            </ol>
            {hasExpandableLeaderboard && (
              <button
                type="button"
                className="leaderboard-toggle-button"
                aria-controls="welcome-leaderboard-list"
                aria-expanded={leaderboardExpanded}
                onClick={() => setLeaderboardExpanded((current) => !current)}
              >
                {leaderboardToggleLabel}
              </button>
            )}
            {leaderboardLoading && <p>{copy.leaderboardLoading}</p>}
          </aside>
        </section>
      </div>
    </main>
  );
}
