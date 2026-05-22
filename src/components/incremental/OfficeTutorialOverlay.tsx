"use client";

import { useEffect } from "react";
import { getCopy, type GameLanguage } from "@/lib/gameTranslations";

const TUTORIAL_TARGETS = [
  "goal",
  "journal",
  "actions",
  "missions",
  "development",
  "menu",
] as const;

export type OfficeTutorialTarget = (typeof TUTORIAL_TARGETS)[number];

const TUTORIAL_TARGET_SELECTORS: Record<OfficeTutorialTarget, string> = {
  goal: ".office-floor",
  journal: ".journal-panel",
  actions: ".office-action-wall",
  missions: ".todo-panel",
  development: ".shop-panel",
  menu: ".office-top-controls",
};

const TUTORIAL_SCROLL_BLOCK: Record<OfficeTutorialTarget, ScrollLogicalPosition> = {
  goal: "center",
  journal: "center",
  actions: "center",
  missions: "start",
  development: "start",
  menu: "center",
};

export function getOfficeTutorialTarget(stepIndex: number): OfficeTutorialTarget {
  return TUTORIAL_TARGETS[Math.min(Math.max(stepIndex, 0), TUTORIAL_TARGETS.length - 1)];
}

export function OfficeTutorialOverlay({
  language = "fr",
  stepIndex,
  target,
  onNext,
  onSkip,
}: {
  language?: GameLanguage;
  stepIndex: number;
  target: OfficeTutorialTarget;
  onNext: () => void;
  onSkip: () => void;
}) {
  const copy = getCopy(language).tutorial;
  const step = copy.steps[Math.min(Math.max(stepIndex, 0), copy.steps.length - 1)];
  const isLastStep = stepIndex >= copy.steps.length - 1;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const targetElement = document.querySelector(TUTORIAL_TARGET_SELECTORS[target]);
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      targetElement?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: TUTORIAL_SCROLL_BLOCK[target],
        inline: "nearest",
      });
    }, 50);

    return () => window.clearTimeout(timeout);
  }, [target]);

  return (
    <div className="tutorial-overlay" role="dialog" aria-modal="true" aria-label={copy.menuLabel}>
      <section className={`paper-card tutorial-card tutorial-card-${target} bg-white`}>
        <p className="tutorial-progress">{copy.progress(stepIndex + 1, copy.steps.length)}</p>
        <h2 className="text-xl font-black">{step.title}</h2>
        <p className="handwritten mt-2 text-sm">{step.body}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <button type="button" className="paper-button bg-white px-4" onClick={onSkip}>
            {copy.skip}
          </button>
          <button type="button" className="paper-button bg-[var(--yellow)] px-4" onClick={onNext}>
            {isLastStep ? copy.finish : copy.next}
          </button>
        </div>
      </section>
    </div>
  );
}
