import { getAchievementBadges } from "@/lib/incrementalAchievements";
import { GameAssetImage } from "@/components/incremental/GameAssetImage";
import { getMilestoneAssetId, getSynergyAssetId } from "@/lib/incrementalAssets";
import { getCopy, getResourceLabel, type GameLanguage } from "@/lib/gameTranslations";
import type { AchievementBadge } from "@/lib/incrementalAchievements";
import type { GameState } from "@/types/incremental";

function effectText(effect: AchievementBadge["effect"], language: GameLanguage): string {
  const effectLabels: Record<string, string> = {
    ideasMultiplier: getResourceLabel("ideas", language).toLowerCase(),
    budgetMultiplier: getResourceLabel("budget", language).toLowerCase(),
    reputationMultiplier: getResourceLabel("reputation", language).toLowerCase(),
    globalMultiplier: "global",
    ambianceBonus: getResourceLabel("ambiance", language).toLowerCase(),
    chaosReduction: `${getResourceLabel("chaos", language).toLowerCase()}/s`,
    resources: language === "en" ? "resource bonus" : language === "es" ? "bonus de recursos" : "bonus de ressources",
  };

  return Object.entries(effect)
    .map(([key, value]) => {
      if (key === "resources") return effectLabels.resources;
      if (key.includes("Multiplier")) {
        return `+${Math.round((value as number) * 100)} % ${effectLabels[key]}`;
      }
      if (key === "chaosReduction") return `-${value} ${effectLabels[key]}`;
      return `+${value} ${effectLabels[key] ?? key}`;
    })
    .join(" · ");
}

export function AchievementsView({
  state,
  language = "fr",
}: {
  state: GameState;
  language?: GameLanguage;
}) {
  const copy = getCopy(language);
  const badges = getAchievementBadges(state);
  const unlockedCount = badges.filter((badge) => badge.unlocked).length;

  return (
    <div className="space-y-5">
      <section className="paper-note bg-[var(--yellow-soft)]">
        <p className="text-xs font-black uppercase tracking-wide">{copy.ui.collection}</p>
        <h2 className="section-title-with-asset mt-1 text-3xl font-black">
          <GameAssetImage assetId="badge-medal" alt="" className="achievement-title-asset" />
          {copy.ui.achievementWall}
        </h2>
        <p className="handwritten mt-2">{copy.ui.achievementCount(unlockedCount, badges.length)}</p>
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
              <div className="achievement-card-heading">
                <GameAssetImage
                  assetId={
                    badge.unlocked
                      ? badge.kind === "combo"
                        ? getSynergyAssetId(badge.id)
                        : getMilestoneAssetId(badge.id)
                      : "ui-lock"
                  }
                  alt=""
                  className="achievement-card-asset"
                />
                <h3 className="font-black">{badge.name}</h3>
              </div>
              <span className="paper-pill">
                {badge.kind === "combo" ? copy.ui.combo : copy.ui.milestone}
              </span>
            </div>

            <p className="handwritten text-sm">{badge.description}</p>
            <p className="text-sm font-bold">
              {badge.unlocked ? effectText(badge.effect, language) : badge.requirement ?? copy.ui.lockedAchievement}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
