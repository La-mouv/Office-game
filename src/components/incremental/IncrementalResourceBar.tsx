import {
  RESOURCE_LABELS,
  formatNumber,
  formatPerSecond,
  formatPercent,
} from "@/lib/incrementalUi";
import { GameAssetImage } from "@/components/incremental/GameAssetImage";
import { RESOURCE_ASSET_IDS } from "@/lib/incrementalAssets";
import { OfficeTopControls } from "@/components/incremental/OfficeTopControls";
import type { ReactNode } from "react";
import type { GameState, ProductionSummary } from "@/types/incremental";

export function IncrementalResourceBar({
  state,
  production,
  onNewGame,
  onSave,
  onLoad,
  incidentControl,
}: {
  state: GameState;
  production: ProductionSummary;
  onNewGame: () => void;
  onSave: () => void;
  onLoad: () => void;
  incidentControl?: ReactNode;
}) {
  return (
    <div className="resource-header">
      <div className="resource-header-top">
        <div className="game-title-chip">
          <GameAssetImage assetId="location-starting-office" alt="" className="title-chip-asset" />
          <strong>Office Village</strong>
        </div>

        <div className="resource-pill-row">
          {(["ideas", "budget", "reputation"] as const).map((resource) => (
            <div key={resource} className="paper-pill compact-pill">
              <GameAssetImage
                assetId={RESOURCE_ASSET_IDS[resource]}
                alt=""
                className="resource-pill-asset"
              />
              <span className="hidden text-xs sm:inline">{RESOURCE_LABELS[resource]}</span>
              <strong>{formatNumber(state.resources[resource])}</strong>
              <span className="text-xs opacity-70">
                {formatPerSecond(production.perSecond[resource])}
              </span>
            </div>
          ))}

          <OfficeTopControls state={state} onNewGame={onNewGame} onSave={onSave} onLoad={onLoad} />
        </div>
      </div>

      <div className={`resource-meter-row ${incidentControl ? "resource-meter-row-with-incident" : ""}`}>
        <div className="resource-meter">
          <div className="mb-2 flex items-center justify-between text-xs font-bold">
            <span className="meter-label">
              <GameAssetImage
                assetId={RESOURCE_ASSET_IDS.ambiance}
                alt=""
                className="meter-label-asset"
              />
              Ambiance
            </span>
            <span>{formatPercent(state.resources.ambiance)}</span>
          </div>
          <div className="resource-track">
            <div
              className="h-full bg-[var(--green)] transition-[width] duration-300"
              style={{ width: `${state.resources.ambiance}%` }}
            />
          </div>
        </div>

        {incidentControl && <div className="resource-incident-slot">{incidentControl}</div>}

        <div className="resource-meter">
          <div className="mb-2 flex items-center justify-between text-xs font-bold">
            <span className="meter-label">
              <GameAssetImage
                assetId={RESOURCE_ASSET_IDS.chaos}
                alt=""
                className="meter-label-asset"
              />
              Chaos
            </span>
            <span>{formatPercent(state.resources.chaos)}</span>
          </div>
          <div className="resource-track">
            <div
              className="h-full bg-[var(--orange)] transition-[width] duration-300"
              style={{ width: `${state.resources.chaos}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
