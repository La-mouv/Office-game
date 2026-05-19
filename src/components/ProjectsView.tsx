import { GameCard } from "@/components/GameCard";
import { PROJECT_CARDS } from "@/lib/cards";
import { calculateProjectSuccessChance } from "@/lib/gameLogic";
import type { GameState } from "@/types/game";

type ProjectsViewProps = {
  state: GameState;
  onLaunch: (projectId: string) => void;
};

export function ProjectsView({ state, onLaunch }: ProjectsViewProps) {
  return (
    <div className="space-y-6">
      {state.activeProjects.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-2xl font-black">Projets en cours</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {state.activeProjects.map((project) => (
              <div key={project.id} className="paper-note bg-[var(--yellow-soft)]">
                <h3 className="font-black">
                  {PROJECT_CARDS.find((card) => card.id === project.cardId)?.name}
                </h3>
                <p>Chance de réussite : {project.successChance}%</p>
                <p>Jours restants : {project.turnsRemaining}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-2xl font-black">Projets disponibles</h2>
        <div className="grid gap-4 xl:grid-cols-2">
          {PROJECT_CARDS.map((project) => {
            const completed = state.completedProjects.includes(project.id);
            const chance = calculateProjectSuccessChance(state, project);

            return (
              <div key={project.id} className="space-y-2">
                <GameCard card={project} />
                <div className="paper-note flex items-center justify-between gap-3 bg-white">
                  <span>Chance : {chance}%</span>
                  <button
                    type="button"
                    className="paper-button bg-[var(--orange)] disabled:opacity-50"
                    disabled={completed}
                    onClick={() => onLaunch(project.id)}
                  >
                    {completed ? "Terminé" : "Lancer"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
