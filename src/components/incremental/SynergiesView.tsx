import { GameAssetImage } from "@/components/incremental/GameAssetImage";
import { getSynergyAssetId } from "@/lib/incrementalAssets";
import type { GameState } from "@/types/incremental";

const EFFECT_LABELS: Record<string, string> = {
  ideasMultiplier: "idées",
  budgetMultiplier: "budget",
  reputationMultiplier: "réputation",
  globalMultiplier: "global",
  ambianceBonus: "ambiance",
  chaosReduction: "chaos/s",
};

function requirementText(state: GameState, synergyId: string): string {
  const synergy = state.synergies.find((candidate) => candidate.id === synergyId);
  if (!synergy) return "";

  const workerRequirements = Object.entries(synergy.requirements.workers ?? {}).map(
    ([workerId, count]) => {
      const worker = state.workers.find((candidate) => candidate.id === workerId);
      return `${count} × ${worker?.name ?? workerId}`;
    },
  );
  const locationRequirements = (synergy.requirements.locations ?? []).map((locationId) => {
    const location = state.locations.find((candidate) => candidate.id === locationId);
    return location?.name ?? locationId;
  });

  return [...workerRequirements, ...locationRequirements].join(" + ");
}

function effectText(effect: GameState["synergies"][number]["effect"]): string {
  return Object.entries(effect)
    .map(([key, value]) => {
      if (key.includes("Multiplier")) return `+${Math.round((value ?? 0) * 100)} % ${EFFECT_LABELS[key]}`;
      if (key === "chaosReduction") return `-${value} ${EFFECT_LABELS[key]}`;
      return `+${value} ${EFFECT_LABELS[key] ?? key}`;
    })
    .join(" · ");
}

export function SynergiesView({ state }: { state: GameState }) {
  const active = state.synergies.filter((synergy) => synergy.discovered);
  const locked = state.synergies.filter((synergy) => !synergy.discovered);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-2xl font-black">Combos actifs</h2>
        {active.length === 0 ? (
          <div className="paper-note">
            <p className="handwritten">Pas encore de combo. Le bureau apprend à respirer ensemble.</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {active.map((synergy) => (
              <article key={synergy.id} className="paper-note bg-[var(--mint)]">
                <GameAssetImage
                  assetId={getSynergyAssetId(synergy.id)}
                  alt=""
                  className="achievement-card-asset"
                />
                <h3 className="font-black">{synergy.name}</h3>
                <p className="handwritten mt-2 text-sm">{synergy.description}</p>
                <p className="mt-3 text-sm font-bold">{effectText(synergy.effect)}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-black">Combos verrouillés</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {locked.map((synergy) => (
            <article key={synergy.id} className="paper-note bg-white">
              <GameAssetImage
                assetId={getSynergyAssetId(synergy.id)}
                alt=""
                className="achievement-card-asset"
              />
              <h3 className="font-black">{synergy.name}</h3>
              <p className="handwritten mt-2 text-sm">{synergy.description}</p>
              <p className="locked-notice mt-3 text-sm">
                <GameAssetImage assetId="ui-lock" alt="" className="notice-asset-icon" />
                {requirementText(state, synergy.id)}
              </p>
              <p className="mt-2 text-sm">{effectText(synergy.effect)}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
