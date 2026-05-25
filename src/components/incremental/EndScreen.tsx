import Image from "next/image";
import { formatLeaderboardTime, type LeaderboardEntry } from "@/lib/leaderboard";
import type { GameLanguage, TranslationBundle } from "@/lib/gameTranslations";

type EndScreenCopy = {
  welcome: TranslationBundle["welcome"];
  ui: TranslationBundle["ui"];
};

export function EndScreen({
  copy,
  language,
  playerName,
  elapsedMs,
  playerEntry,
  leaderboardEntries,
  leaderboardLoading,
  onRestart,
}: {
  copy: EndScreenCopy;
  language: GameLanguage;
  playerName: string;
  elapsedMs: number;
  playerEntry?: LeaderboardEntry | null;
  leaderboardEntries: LeaderboardEntry[];
  leaderboardLoading: boolean;
  onRestart: () => void;
}) {
  const entries = leaderboardEntries.slice(0, 5);
  const rankLabel = playerEntry ? `#${playerEntry.rank}` : "--";
  const finalTime = formatLeaderboardTime(playerEntry?.elapsedMs ?? elapsedMs);

  return (
    <main className="end-screen" lang={language} style={{ position: "relative" }}>
      <Image
        src="/game-assets/office-village-cover.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="welcome-cover-image"
      />

      <section className="end-panel" aria-label={copy.ui.endScreenTitle}>
        <div className="end-hero">
          <p className="welcome-eyebrow">{copy.ui.endScreenEyebrow}</p>
          <h1>{copy.ui.endScreenTitle}</h1>
          <p className="handwritten">{copy.ui.endScreenBody}</p>
        </div>

        <div className="end-score-grid">
          <div className="end-score-card">
            <span>{copy.ui.endPlayer}</span>
            <strong>{playerName}</strong>
          </div>
          <div className="end-score-card">
            <span>{copy.ui.endTime}</span>
            <strong>{finalTime}</strong>
          </div>
          <div className="end-score-card end-score-rank">
            <span>{copy.ui.endRank}</span>
            <strong>{rankLabel}</strong>
          </div>
        </div>

        <aside className="welcome-leaderboard end-leaderboard" aria-label={copy.welcome.leaderboardTitle}>
          <div className="welcome-leaderboard-heading">
            <h2>{copy.welcome.leaderboardTitle}</h2>
            <span>{leaderboardLoading ? copy.ui.endLeaderboardSyncing : copy.ui.endLeaderboardReady}</span>
          </div>
          <ol>
            {entries.length > 0
              ? entries.map((entry) => (
                  <li
                    key={`${entry.rank}-${entry.playerName}-${entry.elapsedMs}-${entry.createdAt}`}
                    className={playerEntry?.rank === entry.rank ? "end-player-row" : ""}
                  >
                    <strong>#{entry.rank}</strong>
                    <span>{entry.playerName}</span>
                    <em>{formatLeaderboardTime(entry.elapsedMs)}</em>
                  </li>
                ))
              : [1, 2, 3].map((rank) => (
                  <li key={rank}>
                    <strong>#{rank}</strong>
                    <span>{copy.welcome.leaderboardPlaceholder}</span>
                    <em>--:--</em>
                  </li>
                ))}
          </ol>
          {playerEntry && !entries.some((entry) => entry.rank === playerEntry.rank) && (
            <div className="end-player-rank-note">
              <strong>#{playerEntry.rank}</strong>
              <span>{playerEntry.playerName}</span>
              <em>{formatLeaderboardTime(playerEntry.elapsedMs)}</em>
            </div>
          )}
        </aside>

        <button type="button" className="welcome-start-button" onClick={onRestart}>
          {copy.ui.restart}
        </button>
      </section>
    </main>
  );
}
