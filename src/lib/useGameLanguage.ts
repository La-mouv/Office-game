"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  isGameLanguage,
  type GameLanguage,
} from "@/lib/gameTranslations";

const LANGUAGE_CHANGE_EVENT = "office-village-language-change";
let fallbackLanguage: GameLanguage = DEFAULT_LANGUAGE;

function readStoredLanguage(): GameLanguage {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isGameLanguage(stored) ? stored : DEFAULT_LANGUAGE;
  } catch {
    return fallbackLanguage;
  }
}

function subscribeToLanguageChanges(onChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onChange);
  window.addEventListener(LANGUAGE_CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, onChange);
  };
}

export function useGameLanguage(): GameLanguage {
  return useSyncExternalStore(subscribeToLanguageChanges, readStoredLanguage, () => DEFAULT_LANGUAGE);
}

export function setStoredGameLanguage(language: GameLanguage): void {
  fallbackLanguage = language;

  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // If persistence is blocked, the UI still receives the current click event.
  }

  window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
}
