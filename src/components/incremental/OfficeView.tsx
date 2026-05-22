import { GameLog } from "@/components/GameLog";
import { MissionTodoPanel } from "@/components/incremental/MissionTodoPanel";
import { OfficeShopPanel } from "@/components/incremental/OfficeShopPanel";
import {
  getOfficeTutorialTarget,
  OfficeTutorialOverlay,
  type OfficeTutorialTarget,
} from "@/components/incremental/OfficeTutorialOverlay";
import { OfficeVillagePreview } from "@/components/incremental/OfficeVillagePreview";
import type { GainBubble, SceneReaction } from "@/lib/incrementalPresentation";
import type { GameLanguage } from "@/lib/gameTranslations";
import { getRunElapsedMs } from "@/lib/incrementalGame";
import type { GameState, ProductionSummary } from "@/types/incremental";

export function OfficeView({
  language = "fr",
  state,
  production,
  now,
  gainBubbles,
  sceneReaction,
  onNewGame,
  onBuyWorker,
  onUpgradeWorker,
  onBuyOrUpgradeLocation,
  onUnlockSkill,
  onUseManualAction,
  onResolveIncident,
  onLanguageChange,
  onOpenTutorial,
  tutorialVisible = false,
  tutorialStepIndex = 0,
  onTutorialNext,
  onTutorialSkip,
}: {
  language?: GameLanguage;
  state: GameState;
  production: ProductionSummary;
  now: number;
  gainBubbles: GainBubble[];
  sceneReaction: SceneReaction;
  onNewGame: () => void;
  onSave?: () => void;
  onLoad?: () => void;
  onBuyWorker: (workerId: string) => void;
  onUpgradeWorker: (workerId: string) => void;
  onBuyOrUpgradeLocation: (locationId: string) => void;
  onUnlockSkill: (skillId: string) => void;
  onUseManualAction: (actionId: string) => void;
  onResolveIncident: (incidentId: string, choiceId: string) => void;
  onLanguageChange?: (language: GameLanguage) => void;
  onOpenTutorial?: () => void;
  tutorialVisible?: boolean;
  tutorialStepIndex?: number;
  onTutorialNext?: () => void;
  onTutorialSkip?: () => void;
}) {
  const tutorialTarget: OfficeTutorialTarget | null = tutorialVisible
    ? getOfficeTutorialTarget(tutorialStepIndex)
    : null;

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
          onBuyWorker={onBuyWorker}
          onUpgradeWorker={onUpgradeWorker}
          onBuyOrUpgradeLocation={onBuyOrUpgradeLocation}
          onUseManualAction={onUseManualAction}
          onResolveIncident={onResolveIncident}
          onLanguageChange={onLanguageChange}
          onOpenTutorial={onOpenTutorial}
          tutorialTarget={tutorialTarget}
        />

        <div className="office-activity-grid">
          <MissionTodoPanel
            state={state}
            now={now}
            language={language}
            highlighted={tutorialTarget === "missions"}
          />
          <GameLog
            entries={state.log}
            language={language}
            elapsedMs={getRunElapsedMs(state, now)}
            highlighted={tutorialTarget === "journal"}
          />
        </div>
      </div>

      <OfficeShopPanel
        state={state}
        language={language}
        onBuyWorker={onBuyWorker}
        onUpgradeWorker={onUpgradeWorker}
        onBuyOrUpgradeLocation={onBuyOrUpgradeLocation}
        onUnlockSkill={onUnlockSkill}
        highlighted={tutorialTarget === "development"}
      />

      {tutorialVisible && tutorialTarget && onTutorialNext && onTutorialSkip && (
        <OfficeTutorialOverlay
          language={language}
          stepIndex={tutorialStepIndex}
          target={tutorialTarget}
          onNext={onTutorialNext}
          onSkip={onTutorialSkip}
        />
      )}
    </div>
  );
}
