import { GameLog } from "@/components/GameLog";
import { MissionTodoPanel } from "@/components/incremental/MissionTodoPanel";
import { OfficeShopPanel } from "@/components/incremental/OfficeShopPanel";
import { OfficeVillagePreview } from "@/components/incremental/OfficeVillagePreview";
import type { GainBubble, SceneReaction } from "@/lib/incrementalPresentation";
import type { GameState, ProductionSummary } from "@/types/incremental";

export function OfficeView({
  state,
  production,
  now,
  gainBubbles,
  sceneReaction,
  onNewGame,
  onSave,
  onLoad,
  onBuyWorker,
  onUpgradeWorker,
  onBuyOrUpgradeLocation,
  onUnlockSkill,
  onUseManualAction,
  onResolveIncident,
}: {
  state: GameState;
  production: ProductionSummary;
  now: number;
  gainBubbles: GainBubble[];
  sceneReaction: SceneReaction;
  onNewGame: () => void;
  onSave: () => void;
  onLoad: () => void;
  onBuyWorker: (workerId: string) => void;
  onUpgradeWorker: (workerId: string) => void;
  onBuyOrUpgradeLocation: (locationId: string) => void;
  onUnlockSkill: (skillId: string) => void;
  onUseManualAction: (actionId: string) => void;
  onResolveIncident: (incidentId: string, choiceId: string) => void;
}) {
  return (
    <div className="office-layout">
      <div className="space-y-4">
        <OfficeVillagePreview
          state={state}
          production={production}
          now={now}
          gainBubbles={gainBubbles}
          sceneReaction={sceneReaction}
          onNewGame={onNewGame}
          onSave={onSave}
          onLoad={onLoad}
          onBuyWorker={onBuyWorker}
          onUpgradeWorker={onUpgradeWorker}
          onBuyOrUpgradeLocation={onBuyOrUpgradeLocation}
          onUseManualAction={onUseManualAction}
          onResolveIncident={onResolveIncident}
        />

        <div className="office-activity-grid">
          <MissionTodoPanel state={state} now={now} />
          <GameLog entries={state.log} />
        </div>
      </div>

      <OfficeShopPanel
        state={state}
        onBuyWorker={onBuyWorker}
        onUpgradeWorker={onUpgradeWorker}
        onBuyOrUpgradeLocation={onBuyOrUpgradeLocation}
        onUnlockSkill={onUnlockSkill}
      />
    </div>
  );
}
