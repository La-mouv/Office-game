import { formatNumber } from "@/lib/incrementalUi";
import { getLocationCost } from "@/lib/incrementalGame";
import { GameAssetImage } from "@/components/incremental/GameAssetImage";
import { getLocationAssetId } from "@/lib/incrementalAssets";
import { classifyLocationCard } from "@/lib/incrementalPresentation";
import {
  getCopy,
  getResourceLabel,
  type GameLanguage,
} from "@/lib/gameTranslations";
import type { OfficeLocation } from "@/types/incremental";

function formatLocationEffect(location: OfficeLocation, language: GameLanguage): string {
  const copy = getCopy(language);
  const effectLabels: Record<string, string> = {
    ideasMultiplier: getResourceLabel("ideas", language).toLowerCase(),
    budgetMultiplier: getResourceLabel("budget", language).toLowerCase(),
    reputationMultiplier: getResourceLabel("reputation", language).toLowerCase(),
    globalMultiplier: language === "es" ? "global" : "global",
  };
  const entries = Object.entries(location.effect);
  if (entries.length === 0) return copy.ui.noEffect;

  return entries
    .map(([key, value]) => {
      const finalValue = (value ?? 0) * location.level;
      if (key.includes("Multiplier")) {
        return `+${Math.round(finalValue * 100)} % ${effectLabels[key] ?? key}`;
      }
      if (key === "ambianceBonus") return `+${finalValue} ${getResourceLabel("ambiance", language).toLowerCase()}`;
      if (key === "chaosPerSecond") return `+${finalValue}/s ${getResourceLabel("chaos", language).toLowerCase()}`;
      if (key === "chaosReduction") return `-${finalValue}/s ${getResourceLabel("chaos", language).toLowerCase()}`;
      return `${key} ${finalValue}`;
    })
    .join(" · ");
}

export function LocationCard({
  language = "fr",
  location,
  reputation,
  budget,
  onBuyOrUpgrade,
  variant = "shop",
}: {
  language?: GameLanguage;
  location: OfficeLocation;
  reputation: number;
  budget: number;
  onBuyOrUpgrade: () => void;
  variant?: "shop" | "office";
}) {
  const copy = getCopy(language);
  const isOffice = variant === "office";
  const locked = reputation < location.unlockReputation;
  const cost = getLocationCost(location);
  const maxed = location.owned && location.level >= location.maxLevel;
  const levelLabel = maxed ? copy.ui.max : `${copy.ui.level} ${location.level}`;
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
          {copy.ui.unlockedAt(getResourceLabel("reputation", language).toLowerCase(), formatNumber(location.unlockReputation, language))}
        </p>
      )}
      {isOffice && <p className="office-card-stat text-sm">{formatLocationEffect(location, language)}</p>}

      {locked && isOffice ? (
        <p className="locked-notice">
          <GameAssetImage assetId="ui-lock" alt="" className="notice-asset-icon" />
          {copy.ui.reputationRequired(formatNumber(location.unlockReputation, language))}
        </p>
      ) : !maxed ? (
        <div className={isOffice ? "office-card-bottom-controls office-card-bottom-controls-single" : ""}>
          <button
            type="button"
            aria-label={isOffice ? `${copy.ui.level} ${formatNumber(cost, language)} €` : undefined}
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
                {formatNumber(cost, language)} €
              </>
            ) : (
              copy.ui.buy(formatNumber(cost, language))
            )}
          </button>
        </div>
      ) : null}
    </article>
  );
}
