import { getAchievementBadges } from "@/lib/incrementalAchievements";
import type { AchievementBadge } from "@/lib/incrementalAchievements";
import type { GameState } from "@/types/incremental";

const EFFECT_LABELS: Record<string, string> = {
  ideasMultiplier: "idées",
  budgetMultiplier: "budget",
  reputationMultiplier: "réputation",
  globalMultiplier: "global",
  ambianceBonus: "ambiance",
  chaosReduction: "chaos/s",
  resources: "ressources",
};

function effectText(effect: AchievementBadge["effect"]): string {
  return Object.entries(effect)
    .map(([key, value]) => {
      if (key === "resources") return "bonus de ressources";
      if (key.includes("Multiplier")) {
        return `+${Math.round((value as number) * 100)} % ${EFFECT_LABELS[key]}`;
      }
      if (key === "chaosReduction") return `-${value} ${EFFECT_LABELS[key]}`;
      return `+${value} ${EFFECT_LABELS[key] ?? key}`;
    })
    .join(" · ");
}

export function AchievementsView({ state }: { state: GameState }) {
  const badges = getAchievementBadges(state);
  const unlockedCount = badges.filter((badge) => badge.unlocked).length;

  return (
    <div className="space-y-5">
      <section className="paper-note bg-[var(--yellow-soft)]">
        <p className="text-xs font-black uppercase tracking-wide">Collection</p>
        <h2 className="mt-1 text-3xl font-black">🏅 Mur des réussites</h2>
        <p className="handwritten mt-2">
          {unlockedCount} réussite{unlockedCount > 1 ? "s" : ""} débloquée
          {unlockedCount > 1 ? "s" : ""}. Les badges gagnés apportent des pouvoirs au bureau.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {badges.map((badge) => (
          <article
            key={`${badge.kind}-${badge.id}`}
            className={`paper-note space-y-3 ${
              badge.unlocked ? "surface-strong bg-[var(--mint)]" : "surface-quiet bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-3xl">{badge.unlocked ? badge.emoji : "🔒"}</p>
                <h3 className="font-black">{badge.name}</h3>
              </div>
              <span className="paper-pill">
                {badge.kind === "combo" ? "Combo" : "Palier"}
              </span>
            </div>

            <p className="handwritten text-sm">{badge.description}</p>
            <p className="text-sm font-bold">
              {badge.unlocked ? effectText(badge.effect) : badge.requirement ?? "À débloquer"}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
