import { SKILL_NODES } from "@/lib/skills";
import type { GameState } from "@/types/game";

type SkillTreeViewProps = {
  state: GameState;
  onUnlock: (skillId: string) => void;
};

const BRANCH_LABELS = {
  productivity: "Productivité",
  comfort: "Confort",
  technical: "Technique",
};

export function SkillTreeView({ state, onUnlock }: SkillTreeViewProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      {(Object.keys(BRANCH_LABELS) as (keyof typeof BRANCH_LABELS)[]).map((branch) => (
        <section key={branch} className="space-y-3">
          <h2 className="text-2xl font-black">{BRANCH_LABELS[branch]}</h2>
          {SKILL_NODES.filter((skill) => skill.branch === branch).map((skill) => {
            const unlocked = state.unlockedSkills.includes(skill.id);
            const prerequisitesMet = skill.prerequisites.every((id) =>
              state.unlockedSkills.includes(id),
            );

            return (
              <div
                key={skill.id}
                className={`paper-note ${unlocked ? "bg-[var(--mint)]" : "bg-white"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-2xl">{skill.iconEmoji}</p>
                    <h3 className="font-black">{skill.name}</h3>
                  </div>
                  <span className="paper-pill">🌱 {skill.cost}</span>
                </div>
                <p className="handwritten mt-2 text-sm">{skill.description}</p>
                <button
                  type="button"
                  disabled={unlocked || !prerequisitesMet}
                  className="paper-button mt-3 bg-[var(--yellow)] disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => onUnlock(skill.id)}
                >
                  {unlocked ? "Débloqué" : "Débloquer"}
                </button>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
