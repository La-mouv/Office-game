import { formatNumber } from "@/lib/incrementalUi";
import { GameAssetImage } from "@/components/incremental/GameAssetImage";
import { getSkillAssetId } from "@/lib/incrementalAssets";
import type { GameState, Skill } from "@/types/incremental";
import { WorkerCard } from "@/components/incremental/WorkerCard";
import { LocationCard } from "@/components/incremental/LocationCard";

const BRANCH_LABELS: Record<Skill["branch"], string> = {
  productivity: "Productivité",
  comfort: "Confort",
  business: "Business",
};

export function UpgradesView({
  state,
  onUnlockSkill,
  onBuyWorker,
  onUpgradeWorker,
  onBuyOrUpgradeLocation,
}: {
  state: GameState;
  onUnlockSkill: (skillId: string) => void;
  onBuyWorker: (workerId: string) => void;
  onUpgradeWorker: (workerId: string) => void;
  onBuyOrUpgradeLocation: (locationId: string) => void;
}) {
  return (
    <div className="space-y-6">
      <section className="paper-note bg-[var(--yellow-soft)]">
        <h2 className="text-2xl font-black">Points de talent</h2>
        <p className="handwritten mt-2">
          Tu gagnes 1 point à chaque grand palier de réputation. C’est rare, précieux, et déjà suivi dans un fichier que personne ne retrouve. Disponible maintenant :{" "}
          <strong>{state.talentPoints}</strong>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-black">Personnages</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {state.workers.map((worker) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              reputation={state.resources.reputation}
              budget={state.resources.budget}
              onBuy={() => onBuyWorker(worker.id)}
              onUpgrade={() => onUpgradeWorker(worker.id)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-black">Lieux</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {state.locations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              reputation={state.resources.reputation}
              budget={state.resources.budget}
              onBuyOrUpgrade={() => onBuyOrUpgradeLocation(location.id)}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-3">
        {(Object.keys(BRANCH_LABELS) as Skill["branch"][]).map((branch) => (
          <section key={branch} className="space-y-3">
            <h2 className="text-2xl font-black">{BRANCH_LABELS[branch]}</h2>
            {state.skills
              .filter((skill) => skill.branch === branch)
              .map((skill) => {
                const locked = state.resources.reputation < skill.unlockReputation;
                const disabled = locked || skill.unlocked || state.talentPoints < skill.cost;

                return (
                  <article
                    key={skill.id}
                    className={`paper-note ${skill.unlocked ? "bg-[var(--mint)]" : "bg-white"}`}
                  >
                    <div className="shop-card-hero">
                      <GameAssetImage
                        assetId={getSkillAssetId(skill.id)}
                        alt=""
                        className="shop-card-asset shop-card-skill-asset"
                      />
                      <div className="min-w-0">
                        <h3 className="font-black">{skill.name}</h3>
                      </div>
                      <span className="paper-pill">
                        <GameAssetImage
                          assetId="resource-talent"
                          alt=""
                          className="resource-pill-asset"
                        />
                        {skill.cost}
                      </span>
                    </div>
                    <p className="handwritten mt-2 text-sm">{skill.description}</p>
                    {locked && (
                      <p className="locked-notice mt-3 text-sm">
                        <GameAssetImage assetId="ui-lock" alt="" className="notice-asset-icon" />
                        {formatNumber(skill.unlockReputation)} réputation requise
                      </p>
                    )}
                    <button
                      type="button"
                      disabled={disabled}
                      className="paper-button mt-3 bg-[var(--yellow)] disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => onUnlockSkill(skill.id)}
                    >
                      {skill.unlocked ? "Débloqué" : "Acheter"}
                    </button>
                  </article>
                );
              })}
          </section>
        ))}
      </div>

    </div>
  );
}
