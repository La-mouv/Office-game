"use client";

import { useEffect, useRef, useState } from "react";
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

export function GameLog({ entries }: { entries: string[] }) {
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
    <details className="journal-panel" open>
      <summary className="cursor-pointer font-black">Journal</summary>
      <div className="mt-3 space-y-2 text-sm">
        {typedEntries.map((entry, index) => (
          <p key={`${recentEntries[index]}-${index}`} className="handwritten">
            {entry.text}
            {entry.typing && (
              <span aria-hidden className="typing-cursor">
                |
              </span>
            )}
          </p>
        ))}
      </div>
    </details>
  );
}
