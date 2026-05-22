"use client";

import { useEffect, useRef, useState } from "react";
import { getCopy, type GameLanguage } from "@/lib/gameTranslations";
import { getRecentLogEntries } from "@/lib/incrementalPresentation";

export function getTypingState(entries: string[], visibleCharacters: number) {
  return entries.map((entry, index) => {
    const isLatestEntry = index === entries.length - 1;

    if (!isLatestEntry) {
      return { text: entry, typing: false };
    }

    const visibleText = entry.slice(0, visibleCharacters);
    const typing = visibleText.length < entry.length;

    return {
      text: typing ? visibleText : entry,
      typing,
    };
  });
}

export function formatRunElapsedTime(elapsedMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function GameLog({
  entries,
  language = "fr",
  elapsedMs,
  highlighted = false,
}: {
  entries: string[];
  language?: GameLanguage;
  elapsedMs?: number;
  highlighted?: boolean;
}) {
  const copy = getCopy(language);
  const recentEntries = getRecentLogEntries(entries, 4);
  const latestEntry = recentEntries.at(-1) ?? "";
  const [visibleCharacters, setVisibleCharacters] = useState(latestEntry.length);
  const previousEntryCountRef = useRef(entries.length);
  const previousLatestEntryRef = useRef(latestEntry);

  useEffect(() => {
    const isNewEntry =
      entries.length !== previousEntryCountRef.current ||
      latestEntry !== previousLatestEntryRef.current;

    if (isNewEntry) {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setVisibleCharacters(prefersReducedMotion ? latestEntry.length : 0);
      previousEntryCountRef.current = entries.length;
      previousLatestEntryRef.current = latestEntry;
    }
  }, [entries.length, latestEntry]);

  useEffect(() => {
    if (visibleCharacters >= latestEntry.length) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setVisibleCharacters((current) => Math.min(current + 1, latestEntry.length));
    }, 36);

    return () => window.clearTimeout(timer);
  }, [latestEntry, visibleCharacters]);

  const typedEntries = getTypingState(recentEntries, visibleCharacters);

  return (
    <details className={`journal-panel ${highlighted ? "tutorial-target-active" : ""}`} open>
      <summary className="journal-summary cursor-pointer font-black">
        <span className="journal-summary-label">
          <span className="journal-summary-marker" aria-hidden="true">
            ▾
          </span>
          <span>{copy.ui.journal}</span>
        </span>
        {elapsedMs !== undefined && (
          <span className="journal-timer" aria-label={`${copy.ui.time} ${formatRunElapsedTime(elapsedMs)}`}>
            <span aria-hidden="true">⏱</span>
            <span className="journal-timer-value">{formatRunElapsedTime(elapsedMs)}</span>
          </span>
        )}
      </summary>
      <div className="mt-3 space-y-2 text-sm">
        {typedEntries.length > 0 ? (
          typedEntries.map((entry, index) => (
            <p key={`${recentEntries[index]}-${index}`} className="handwritten">
              {entry.text}
              {entry.typing && (
                <span aria-hidden className="typing-cursor">
                  |
                </span>
              )}
            </p>
          ))
        ) : (
          <p className="handwritten">{copy.ui.emptyLog}</p>
        )}
      </div>
    </details>
  );
}
