"use client";

import { useState } from "react";
import { GameAssetImage } from "@/components/incremental/GameAssetImage";
import { LocationCard } from "@/components/incremental/LocationCard";
import { WorkerCard } from "@/components/incremental/WorkerCard";
import { formatNumber } from "@/lib/incrementalUi";
import { getSkillAssetId } from "@/lib/incrementalAssets";
import type { GameState, OfficeLocation, Skill, Worker } from "@/types/incremental";

type ShopTab = "workers" | "locations" | "upgrades";

const SHOP_TABS: { id: ShopTab; label: string }[] = [
  { id: "workers", label: "Recrutement" },
  { id: "locations", label: "Aménagement" },
  { id: "upgrades", label: "Talents" },
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

export function SkillCard({
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
  const talentLabel = skill.cost > 1 ? "talents" : "talent";

  return (
    <article className="shop-card shop-card-upgrade">
      <div className="shop-card-hero">
        <GameAssetImage
          assetId={getSkillAssetId(skill.id)}
          alt=""
          className="shop-card-asset shop-card-skill-asset"
        />
        <div className="min-w-0">
          <h3 className="font-black">{skill.name}</h3>
        </div>
      </div>
      <p className="handwritten mt-2 text-sm">{skill.description}</p>
      <button
        type="button"
        disabled={disabled}
        className="paper-button mt-3 w-full bg-white disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onUnlock}
      >
        {skill.unlocked ? "Débloqué" : `Acheter ${formatNumber(skill.cost)} ${talentLabel}`}
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
      <h2 className="section-title-with-asset text-xl font-black">
        <GameAssetImage assetId="badge-sparkles" alt="" className="section-title-asset" />
        Développement
      </h2>

      <div className="shop-tabs" aria-label="Choisir une catégorie de développement">
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
              Tout le recrutement actif est déjà dans le Bureau. Le badge d’accès souffle un peu.
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
              Tous les aménagements construits sont déjà dans le Bureau. Les murs font les fiers.
            </p>
          ))}

        {activeTab === "upgrades" &&
          <>
            <div className="paper-pill w-fit bg-[var(--yellow-soft)]">
              <GameAssetImage assetId="resource-talent" alt="" className="resource-pill-asset" />
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
