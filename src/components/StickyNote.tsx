import { TUTORIAL_OBJECTIVES } from "@/lib/gameLogic";

export function StickyNote({ tutorialStep }: { tutorialStep: number }) {
  return (
    <div className="paper-note bg-[var(--yellow)]">
      <p className="text-xs font-black uppercase tracking-wide">Tutoriel</p>
      <p className="handwritten mt-2 text-lg">
        {TUTORIAL_OBJECTIVES[tutorialStep] ?? "Tu connais maintenant les bases du bureau."}
      </p>
    </div>
  );
}
