import { formatNumber } from "@/lib/incrementalUi";
import { getLocationCost } from "@/lib/incrementalGame";
import { GameAssetImage } from "@/components/incremental/GameAssetImage";
import { getLocationAssetId } from "@/lib/incrementalAssets";
import { classifyLocationCard } from "@/lib/incrementalPresentation";
import type { OfficeLocation } from "@/types/incremental";

const EFFECT_LABELS: Record<string, string> = {
  ideasMultiplier: "idées",
  budgetMultiplier: "budget",
  reputationMultiplier: "réputation",
  globalMultiplier: "global",
};

function formatLocationEffect(location: OfficeLocation): string {
  const entries = Object.entries(location.effect);
  if (entries.length === 0) return "Aucun effet";

  return entries
    .map(([key, value]) => {
      const finalValue = (value ?? 0) * location.level;
      if (key.includes("Multiplier")) {
        return `+${Math.round(finalValue * 100)} % ${EFFECT_LABELS[key] ?? key}`;
      }
      if (key === "ambianceBonus") return `+${finalValue} ambiance`;
      if (key === "chaosPerSecond") return `+${finalValue}/s chaos`;
      if (key === "chaosReduction") return `-${finalValue}/s chaos`;
      return `${key} ${finalValue}`;
    })
    .join(" · ");
}

export function LocationCard({
  location,
  reputation,
  budget,
  onBuyOrUpgrade,
  variant = "shop",
}: {
  location: OfficeLocation;
  reputation: number;
  budget: number;
  onBuyOrUpgrade: () => void;
  variant?: "shop" | "office";
}) {
  const isOffice = variant === "office";
  const locked = reputation < location.unlockReputation;
  const cost = getLocationCost(location);
  const maxed = location.owned && location.level >= location.maxLevel;
  const levelLabel = maxed ? "Max" : `Niv. ${location.level}`;
  const showLevelLabel = isOffice && location.owned && !maxed;
  const emphasis = classifyLocationCard(location, reputation, budget);
  const emphasisClass =
    emphasis === "strong"
      ? "surface-strong surface-available"
      : emphasis === "quiet"
        ? "surface-quiet"
        : "";

  return (
    <article
      className={`shop-card space-y-3 ${
        location.owned ? "shop-card-location" : "bg-white"
      } ${emphasisClass} ${isOffice ? "office-board-card" : ""}`}
    >
      <div className="shop-card-hero">
        <GameAssetImage
          assetId={getLocationAssetId(location.id)}
          alt=""
          className="shop-card-asset shop-card-location-asset"
        />
        <div className="min-w-0">
          <h3 className="font-black">{location.name}</h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          {showLevelLabel && <span className="paper-pill">{levelLabel}</span>}
        </div>
      </div>

      {!isOffice && <p className="handwritten text-sm">{location.description}</p>}
      {!isOffice && locked && (
        <p className="unlock-requirement">
          Débloqué à {formatNumber(location.unlockReputation)} réputation
        </p>
      )}
      {isOffice && <p className="office-card-stat text-sm">{formatLocationEffect(location)}</p>}

      {locked && isOffice ? (
        <p className="locked-notice">
          <GameAssetImage assetId="ui-lock" alt="" className="notice-asset-icon" />
          {formatNumber(location.unlockReputation)} réputation requise
        </p>
      ) : !maxed ? (
        <div className={isOffice ? "office-card-bottom-controls office-card-bottom-controls-single" : ""}>
          <button
            type="button"
            aria-label={isOffice ? `Monter niveau ${formatNumber(cost)} €` : undefined}
            disabled={locked || budget < cost}
            className={`paper-button pressable-feedback disabled:cursor-not-allowed disabled:opacity-50 ${
              isOffice
                ? "office-card-action office-card-upgrade-action bg-[var(--mint)]"
                : "bg-[var(--mint)]"
            }`}
            onClick={onBuyOrUpgrade}
          >
            {isOffice ? (
              <>
                <GameAssetImage assetId="ui-upgrade" alt="" className="office-card-action-icon" />
                {formatNumber(cost)} €
              </>
            ) : (
              `Acheter ${formatNumber(cost)} €`
            )}
          </button>
        </div>
      ) : null}
    </article>
  );
}
