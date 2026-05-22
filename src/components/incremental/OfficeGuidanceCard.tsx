import { getMissionProgress } from "@/lib/incrementalMissions";
import { GameAssetImage } from "@/components/incremental/GameAssetImage";
import { getMissionAssetId } from "@/lib/incrementalAssets";
import type { GameState, MissionReward, Resources } from "@/types/incremental";

const RESOURCE_LABELS: Record<keyof Resources, string> = {
  ideas: "idées",
  budget: "budget",
  ambiance: "ambiance",
  reputation: "réputation",
  chaos: "chaos",
};

function formatResourceReward(resources: Partial<Resources> | undefined): string[] {
  if (!resources) return [];

  return (Object.entries(resources) as [keyof Resources, number][])
    .filter(([, amount]) => amount !== 0)
    .map(([resource, amount]) => `${amount > 0 ? "+" : ""}${amount} ${RESOURCE_LABELS[resource]}`);
}

function formatReward(reward: MissionReward): string {
  const parts = formatResourceReward(reward.resources);
  if (reward.boost) {
    parts.push(`${reward.boost.description} pendant ${reward.boost.durationMs / 1000} s`);
  }
  return parts.join(" · ");
}

function formatProgressValue(value: number): string {
  return Math.floor(value).toLocaleString("fr-FR");
}

export function OfficeGuidanceCard({
  state,
  now,
  missionPulseKey,
}: {
  state: GameState;
  now: number;
  missionPulseKey: number;
}) {
  const mission = state.activeMission;
  const boosts = state.activeBoosts.filter((boost) => boost.expiresAt > now);

  if (!mission) {
    return (
      <section key={missionPulseKey} className="mission-card mission-pop">
        <p className="text-xs font-black uppercase tracking-wide">Mission du moment</p>
        <h2 className="mt-1 text-xl font-black">Le bureau improvise</h2>
        <p className="handwritten mt-3 text-sm">
          Rien d’urgent pour l’instant. Profite, c’est probablement une erreur de planning.
        </p>
      </section>
    );
  }

  const progress = getMissionProgress(state, mission.requirement);

  return (
    <section key={missionPulseKey} className="mission-card mission-pop">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide">Mission du moment</p>
          <h2 className="mission-current-title mt-1 text-xl font-black">
            <GameAssetImage
              assetId={getMissionAssetId(mission)}
              alt=""
              className="mission-current-asset"
            />
            {mission.title}
          </h2>
          <p className="handwritten mt-2 text-sm">{mission.description}</p>
        </div>

        <div className="rounded-2xl bg-white px-3 py-2 text-sm font-bold">
          {formatProgressValue(Math.min(progress.current, progress.target))} /{" "}
          {formatProgressValue(progress.target)}
        </div>
      </div>

      <p className="mt-3 rounded-2xl bg-white px-3 py-2 text-sm font-bold">
        Récompense : {formatReward(mission.reward)}
      </p>

      {boosts.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {boosts.map((boost) => (
            <span key={boost.id} className="paper-pill bg-[var(--mint)] text-sm font-bold">
              <GameAssetImage assetId="icon-sparkle" alt="" className="resource-pill-asset" />
              {boost.name} · {boost.description} ·{" "}
              {Math.max(1, Math.ceil((boost.expiresAt - now) / 1000))} s
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
