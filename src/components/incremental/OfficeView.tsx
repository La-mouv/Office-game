import { GameLog } from "@/components/GameLog";
import { MissionTodoPanel } from "@/components/incremental/MissionTodoPanel";
import { OfficeShopPanel } from "@/components/incremental/OfficeShopPanel";
import { OfficeVillagePreview } from "@/components/incremental/OfficeVillagePreview";
import type { GainBubble, SceneReaction } from "@/lib/incrementalPresentation";
import type { GameLanguage } from "@/lib/gameTranslations";
import type { GameState, ProductionSummary } from "@/types/incremental";

export function OfficeView({
  language = "fr",
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
  onLanguageChange,
}: {
  language?: GameLanguage;
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
  onLanguageChange?: (language: GameLanguage) => void;
}) {
  return (
    <div className="office-layout">
      <div className="space-y-4">
        <OfficeVillagePreview
          state={state}
          language={language}
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
          onLanguageChange={onLanguageChange}
        />

        <div className="office-activity-grid">
          <MissionTodoPanel state={state} now={now} language={language} />
          <GameLog entries={state.log} language={language} />
        </div>
      </div>

      <OfficeShopPanel
        state={state}
        language={language}
        onBuyWorker={onBuyWorker}
        onUpgradeWorker={onUpgradeWorker}
        onBuyOrUpgradeLocation={onBuyOrUpgradeLocation}
        onUnlockSkill={onUnlockSkill}
      />
    </div>
  );
}
