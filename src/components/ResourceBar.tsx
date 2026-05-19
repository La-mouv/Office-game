import { RESOURCE_EMOJIS, RESOURCE_LABELS } from "@/lib/ui";
import type { GameState, Resources } from "@/types/game";

const PRIMARY_RESOURCES: (keyof Resources)[] = [
  "ideas",
  "energy",
  "budget",
  "happiness",
  "reputation",
  "stress",
];

export function ResourceBar({ state }: { state: GameState }) {
  return (
    <header className="flex flex-wrap items-center gap-3 border-b-[3px] border-black bg-[var(--background)] px-4 py-3">
      <div className="paper-pill">
        <span>📅</span>
        <strong>Jour {state.day}</strong>
      </div>
      {PRIMARY_RESOURCES.map((resource) => (
        <div key={resource} className="paper-pill">
          <span>{RESOURCE_EMOJIS[resource]}</span>
          <span className="hidden text-xs sm:inline">{RESOURCE_LABELS[resource]}</span>
          <strong>{state.resources[resource]}</strong>
        </div>
      ))}
      <div className="ml-auto paper-pill bg-[var(--yellow)]">
        <span>🎯</span>
        <strong>
          {state.completedProjects.includes("final-project")
            ? "Objectif atteint"
            : "Grand Projet final"}
        </strong>
      </div>
    </header>
  );
}
