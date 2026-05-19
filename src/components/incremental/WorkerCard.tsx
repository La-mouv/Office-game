import { formatNumber, formatResourceEffect } from "@/lib/incrementalUi";
import {
  getWorkerCost,
  getWorkerLevelMultiplier,
  getWorkerUpgradeCost,
} from "@/lib/incrementalGame";
import { classifyWorkerCard } from "@/lib/incrementalPresentation";
import type { Resources, Worker } from "@/types/incremental";

export function WorkerCard({
  worker,
  reputation,
  budget,
  onBuy,
  onUpgrade,
  variant = "shop",
}: {
  worker: Worker;
  reputation: number;
  budget: number;
  onBuy: () => void;
  onUpgrade: () => void;
  variant?: "shop" | "office";
}) {
  const isOffice = variant === "office";
  const locked = reputation < worker.unlockReputation;
  const nextCost = getWorkerCost(worker);
  const upgradeCost = getWorkerUpgradeCost(worker);
  const maxed = worker.level >= 5;
  const levelLabel = maxed ? "Max" : `Niv. ${worker.level}`;
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
      } ${emphasisClass} ${isOffice ? "office-board-card" : ""} ${
        isOffice && worker.count > 1 ? "office-stacked-card" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-3xl">{worker.emoji}</p>
          <h3 className="font-black">{worker.name}</h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          {isOffice && worker.count > 0 && <span className="stack-count-pill">×{worker.count}</span>}
          <span className="paper-pill">{levelLabel}</span>
        </div>
      </div>

      <p className="handwritten text-sm">{worker.description}</p>

      <div className="grid gap-1 text-sm">
        <p>Production : {formatResourceEffect(production)}</p>
      </div>

      {locked ? (
        <p className="rounded-full border-2 border-black bg-white px-3 py-2 text-sm font-bold">
          🔒 {formatNumber(worker.unlockReputation)} réputation requise
        </p>
      ) : (
        <div className={`grid gap-2 ${maxed ? "" : "sm:grid-cols-2"}`}>
          <button
            type="button"
            disabled={budget < nextCost}
            className="paper-button pressable-feedback bg-[var(--yellow)] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onBuy}
          >
            {isOffice ? `+ ${formatNumber(nextCost)} €` : `Acheter ${formatNumber(nextCost)} €`}
          </button>
          {!maxed && (
            <button
              type="button"
              disabled={budget < upgradeCost}
              className="paper-button pressable-feedback bg-white disabled:cursor-not-allowed disabled:opacity-50"
              onClick={onUpgrade}
            >
              {`${isOffice ? "Améliorer" : "Upgrade"} ${formatNumber(upgradeCost)} €`}
            </button>
          )}
        </div>
      )}
    </article>
  );
}
