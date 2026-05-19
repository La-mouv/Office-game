import { formatNumber } from "@/lib/incrementalUi";
import { getLocationCost } from "@/lib/incrementalGame";
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
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-3xl">{location.emoji}</p>
          <h3 className="font-black">{location.name}</h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          {location.owned && <span className="paper-pill">{levelLabel}</span>}
        </div>
      </div>

      <p className="handwritten text-sm">{location.description}</p>
      <p className="text-sm">Effet : {formatLocationEffect(location)}</p>

      {locked ? (
        <p className="rounded-full border-2 border-black bg-white px-3 py-2 text-sm font-bold">
          🔒 {formatNumber(location.unlockReputation)} réputation requise
        </p>
      ) : !maxed ? (
        <button
          type="button"
          disabled={budget < cost}
          className="paper-button pressable-feedback bg-[var(--mint)] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onBuyOrUpgrade}
        >
          {`${location.owned || isOffice ? "Améliorer" : "Construire"} ${formatNumber(cost)} €`}
        </button>
      ) : null}
    </article>
  );
}
