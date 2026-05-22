import { formatNumber, formatResourceEffect } from "@/lib/incrementalUi";
import {
  getWorkerCost,
  getWorkerLevelMultiplier,
  getWorkerUpgradeCost,
} from "@/lib/incrementalGame";
import { GameAssetImage } from "@/components/incremental/GameAssetImage";
import { getWorkerAssetId } from "@/lib/incrementalAssets";
import { classifyWorkerCard } from "@/lib/incrementalPresentation";
import { getCopy, getResourceLabel, type GameLanguage } from "@/lib/gameTranslations";
import type { Resources, Worker } from "@/types/incremental";

export function WorkerCard({
  language = "fr",
  worker,
  reputation,
  budget,
  onBuy,
  onUpgrade,
  variant = "shop",
}: {
  language?: GameLanguage;
  worker: Worker;
  reputation: number;
  budget: number;
  onBuy: () => void;
  onUpgrade: () => void;
  variant?: "shop" | "office";
}) {
  const copy = getCopy(language);
  const isOffice = variant === "office";
  const locked = reputation < worker.unlockReputation;
  const nextCost = getWorkerCost(worker);
  const upgradeCost = getWorkerUpgradeCost(worker);
  const maxed = worker.level >= 5;
  const levelLabel = maxed ? copy.ui.max : `${copy.ui.level} ${worker.level}`;
  const showLevelLabel = isOffice && !maxed;
  const showFloatingCount = isOffice && worker.count > 1;
  const emphasis = classifyWorkerCard(worker, reputation, budget);
  const emphasisClass =
    emphasis === "strong"
      ? "surface-strong surface-available"
      : emphasis === "quiet"
        ? "surface-quiet"
        : "";
  const production = Object.fromEntries(
    (Object.entries(worker.baseProduction) as [keyof Resources, number][]).map(
      ([resource, value]) => [
        resource,
        value * worker.count * getWorkerLevelMultiplier(worker.level),
      ],
    ),
  ) as Partial<Resources>;

  return (
    <article
      className={`shop-card space-y-3 ${
        locked ? "surface-quiet" : "shop-card-worker"
      } ${emphasisClass} ${isOffice ? "office-board-card" : ""}`}
    >
      {showFloatingCount && (
        <span className="stack-count-pill stack-count-floating">×{worker.count}</span>
      )}
      <div className="shop-card-hero">
        <GameAssetImage
          assetId={getWorkerAssetId(worker.id)}
          alt=""
          className="shop-card-asset shop-card-character"
        />
        <div className="min-w-0">
          <h3 className="font-black">{worker.name}</h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          {showLevelLabel && <span className="paper-pill">{levelLabel}</span>}
        </div>
      </div>

      {!isOffice && <p className="handwritten text-sm">{worker.description}</p>}
      {!isOffice && locked && (
        <p className="unlock-requirement">
          {copy.ui.unlockedAt(getResourceLabel("reputation", language).toLowerCase(), formatNumber(worker.unlockReputation, language))}
        </p>
      )}

      {isOffice && (
        <div className="grid gap-1 text-sm">
          <p className="office-card-stat">{formatResourceEffect(production, language)}</p>
        </div>
      )}

      {!isOffice ? (
        <button
          type="button"
          disabled={locked || budget < nextCost}
          className="paper-button pressable-feedback bg-[var(--yellow)] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onBuy}
        >
          {copy.ui.hire(formatNumber(nextCost, language))}
        </button>
      ) : locked ? (
        <p className="locked-notice">
          <GameAssetImage assetId="ui-lock" alt="" className="notice-asset-icon" />
          {copy.ui.reputationRequired(formatNumber(worker.unlockReputation, language))}
        </p>
      ) : (
        <div className={`office-card-bottom-controls ${maxed ? "office-card-bottom-controls-single" : ""}`}>
          <button
            type="button"
            disabled={budget < nextCost}
            className="paper-button office-card-action pressable-feedback bg-[var(--yellow)] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onBuy}
          >
            {isOffice ? `+ ${formatNumber(nextCost, language)} €` : copy.ui.hire(formatNumber(nextCost, language))}
          </button>
          {!maxed && (
            <button
              type="button"
              aria-label={`${copy.ui.level} ${formatNumber(upgradeCost, language)} €`}
              disabled={budget < upgradeCost}
              className="paper-button office-card-action office-card-upgrade-action pressable-feedback bg-white disabled:cursor-not-allowed disabled:opacity-50"
              onClick={onUpgrade}
            >
              <GameAssetImage assetId="ui-upgrade" alt="" className="office-card-action-icon" />
              {formatNumber(upgradeCost, language)} €
            </button>
          )}
        </div>
      )}
    </article>
  );
}
