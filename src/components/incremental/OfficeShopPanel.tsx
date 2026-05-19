"use client";

import { useState } from "react";
import { LocationCard } from "@/components/incremental/LocationCard";
import { WorkerCard } from "@/components/incremental/WorkerCard";
import { formatNumber } from "@/lib/incrementalUi";
import type { GameState, OfficeLocation, Skill, Worker } from "@/types/incremental";

type ShopTab = "workers" | "locations" | "upgrades";

const SHOP_TABS: { id: ShopTab; label: string }[] = [
  { id: "workers", label: "Recrutement" },
  { id: "locations", label: "Aménagement" },
  { id: "upgrades", label: "Upgrades" },
];

function onlyActionableAndNextLocked<T extends Worker | OfficeLocation>(
  items: T[],
  reputation: number,
): T[] {
  const unlocked = items.filter((item) => item.unlockReputation <= reputation);
  const nextLocked = items
    .filter((item) => item.unlockReputation > reputation)
    .sort((a, b) => a.unlockReputation - b.unlockReputation)[0];

  return nextLocked ? [...unlocked, nextLocked] : unlocked;
}

export function getDevelopmentWorkers(workers: Worker[], reputation: number): Worker[] {
  return onlyActionableAndNextLocked(
    workers.filter((worker) => worker.count === 0),
    reputation,
  );
}

export function getDevelopmentLocations(
  locations: OfficeLocation[],
  reputation: number,
): OfficeLocation[] {
  return onlyActionableAndNextLocked(
    locations.filter((location) => !location.owned),
    reputation,
  );
}

function SkillCard({
  skill,
  state,
  onUnlock,
}: {
  skill: Skill;
  state: GameState;
  onUnlock: () => void;
}) {
  const locked = state.resources.reputation < skill.unlockReputation;
  const disabled = locked || skill.unlocked || state.talentPoints < skill.cost;

  return (
    <article className="shop-card shop-card-upgrade">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xl">{skill.emoji}</p>
          <h3 className="font-black">{skill.name}</h3>
        </div>
        <span className="paper-pill">🌱 {skill.cost}</span>
      </div>
      <p className="handwritten mt-2 text-sm">{skill.description}</p>
      {locked && (
        <p className="mt-2 text-xs font-bold">
          🔒 {formatNumber(skill.unlockReputation)} réputation requise
        </p>
      )}
      <button
        type="button"
        disabled={disabled}
        className="paper-button mt-3 w-full bg-white disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onUnlock}
      >
        {skill.unlocked ? "Débloqué" : "Débloquer"}
      </button>
    </article>
  );
}

export function OfficeShopPanel({
  state,
  onBuyWorker,
  onUpgradeWorker,
  onBuyOrUpgradeLocation,
  onUnlockSkill,
}: {
  state: GameState;
  onBuyWorker: (workerId: string) => void;
  onUpgradeWorker: (workerId: string) => void;
  onBuyOrUpgradeLocation: (locationId: string) => void;
  onUnlockSkill: (skillId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<ShopTab>("workers");
  const visibleWorkers = getDevelopmentWorkers(state.workers, state.resources.reputation);
  const visibleLocations = getDevelopmentLocations(state.locations, state.resources.reputation);

  return (
    <aside className="paper-note shop-panel space-y-3">
      <h2 className="text-xl font-black">🛠️ Développement</h2>

      <div className="grid grid-cols-3 gap-2">
        {SHOP_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`shop-tab ${activeTab === tab.id ? "shop-tab-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {activeTab === "workers" &&
          (visibleWorkers.length > 0 ? (
            visibleWorkers.map((worker) => (
              <WorkerCard
                key={worker.id}
                worker={worker}
                reputation={state.resources.reputation}
                budget={state.resources.budget}
                onBuy={() => onBuyWorker(worker.id)}
                onUpgrade={() => onUpgradeWorker(worker.id)}
              />
            ))
          ) : (
            <p className="handwritten rounded-2xl bg-white/70 p-3 text-sm">
              Tout le recrutement actif est maintenant dans le Bureau.
            </p>
          ))}

        {activeTab === "locations" &&
          (visibleLocations.length > 0 ? (
            visibleLocations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                reputation={state.resources.reputation}
                budget={state.resources.budget}
                onBuyOrUpgrade={() => onBuyOrUpgradeLocation(location.id)}
              />
            ))
          ) : (
            <p className="handwritten rounded-2xl bg-white/70 p-3 text-sm">
              Tous les aménagements construits sont maintenant dans le Bureau.
            </p>
          ))}

        {activeTab === "upgrades" &&
          <>
            <div className="paper-pill w-fit bg-[var(--yellow-soft)]">
              <span>🌱</span>
              <strong>{state.talentPoints}</strong>
              <span>talent</span>
            </div>
            {state.skills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                state={state}
                onUnlock={() => onUnlockSkill(skill.id)}
              />
            ))}
          </>}
      </div>
    </aside>
  );
}
