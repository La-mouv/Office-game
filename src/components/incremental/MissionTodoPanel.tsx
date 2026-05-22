import { GameAssetImage } from "@/components/incremental/GameAssetImage";
import { getCopy, type GameLanguage } from "@/lib/gameTranslations";
import { buildMissionTodoItems } from "@/lib/incrementalPresentation";
import { formatResourceEffect } from "@/lib/incrementalUi";
import { getMissionAssetId } from "@/lib/incrementalAssets";
import type { GameState, MissionReward } from "@/types/incremental";

function formatMissionReward(reward: MissionReward, language: GameLanguage): string {
  const copy = getCopy(language);
  const parts: string[] = [];
  if (reward.resources) {
    parts.push(formatResourceEffect(reward.resources, language));
  }
  if (reward.boost) {
    parts.push(`${reward.boost.description} ${copy.ui.rewardDuring(reward.boost.durationMs / 1000)}`);
  }
  return parts.join(" · ");
}

export function MissionTodoPanel({
  state,
  now,
  language = "fr",
}: {
  state: GameState;
  now: number;
  language?: GameLanguage;
}) {
  const copy = getCopy(language);
  const missionTodos = buildMissionTodoItems(state);
  const activeMission = state.activeMission;
  const activeBoosts = state.activeBoosts.filter((boost) => boost.expiresAt > now);

  return (
    <details className="journal-panel todo-panel" open>
      <summary className="cursor-pointer font-black">{copy.ui.toDo}</summary>
      <div className="todo-feed mt-3 space-y-2 text-sm">
        {missionTodos.map((mission) => (
          <p
            key={mission.id}
            className={`todo-feed-line handwritten ${mission.completed ? "mission-todo-done" : ""}`}
          >
            <span className={`todo-status ${mission.completed ? "todo-status-done" : ""}`}>
              {mission.completed && (
                <GameAssetImage assetId="ui-check" alt="" className="todo-status-asset" />
              )}
            </span>
            <span>{mission.title}</span>
          </p>
        ))}
      </div>

      {activeMission && (
        <div className="todo-current-note mt-3">
          <p className="text-xs font-black uppercase tracking-wide">{copy.ui.doNow}</p>
          <p className="mission-current-title mt-1 font-bold">
            <GameAssetImage
              assetId={getMissionAssetId(activeMission)}
              alt=""
              className="mission-current-asset"
            />
            {activeMission.title}
          </p>
          <p className="handwritten mt-1 text-sm">{activeMission.description}</p>
          <p className="mt-1 text-xs font-bold">
            {copy.ui.reward} {formatMissionReward(activeMission.reward, language)}
          </p>
        </div>
      )}

      {activeBoosts.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeBoosts.map((boost) => (
            <span key={boost.id} className="paper-pill bg-[var(--mint)] text-xs font-bold">
              <GameAssetImage assetId="icon-sparkle" alt="" className="resource-pill-asset" />
              {boost.name} · {Math.max(1, Math.ceil((boost.expiresAt - now) / 1000))} s
            </span>
          ))}
        </div>
      )}
    </details>
  );
}
