import { getMissionProgress } from "@/lib/incrementalMissions";
import { buildMissionTodoItems } from "@/lib/incrementalPresentation";
import { formatResourceEffect } from "@/lib/incrementalUi";
import type { GameState, MissionReward } from "@/types/incremental";

function formatMissionReward(reward: MissionReward): string {
  const parts: string[] = [];
  if (reward.resources) {
    parts.push(formatResourceEffect(reward.resources));
  }
  if (reward.boost) {
    parts.push(`${reward.boost.description} pendant ${reward.boost.durationMs / 1000} s`);
  }
  return parts.join(" · ");
}

function formatProgressValue(value: number): string {
  return Math.floor(value).toLocaleString("fr-FR");
}

export function MissionTodoPanel({ state, now }: { state: GameState; now: number }) {
  const missionTodos = buildMissionTodoItems(state);
  const activeMission = state.activeMission;
  const missionProgress = activeMission
    ? getMissionProgress(state, activeMission.requirement)
    : null;
  const activeBoosts = state.activeBoosts.filter((boost) => boost.expiresAt > now);

  return (
    <details className="journal-panel todo-panel" open>
      <summary className="cursor-pointer font-black">To-do</summary>
      <div className="todo-feed mt-3 space-y-2 text-sm">
        {missionTodos.map((mission) => (
          <p
            key={mission.id}
            className={`todo-feed-line handwritten ${mission.completed ? "mission-todo-done" : ""}`}
          >
            <span>{mission.completed ? "✅" : "⬜"}</span>
            <span>{mission.title}</span>
          </p>
        ))}
      </div>

      {activeMission && missionProgress && (
        <div className="todo-current-note mt-3">
          <p className="text-xs font-black uppercase tracking-wide">À faire maintenant</p>
          <p className="mt-1 font-bold">
            <span aria-hidden="true">{activeMission.emoji}</span> {activeMission.title}
          </p>
          <p className="handwritten mt-1 text-sm">{activeMission.description}</p>
          <p className="mt-2 text-sm font-bold">
            {formatProgressValue(Math.min(missionProgress.current, missionProgress.target))} /{" "}
            {formatProgressValue(missionProgress.target)}
          </p>
          <p className="mt-1 text-xs font-bold">Récompense : {formatMissionReward(activeMission.reward)}</p>
        </div>
      )}

      {activeBoosts.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeBoosts.map((boost) => (
            <span key={boost.id} className="paper-pill bg-[var(--mint)] text-xs font-bold">
              ⚡ {boost.name} · {Math.max(1, Math.ceil((boost.expiresAt - now) / 1000))} s
            </span>
          ))}
        </div>
      )}
    </details>
  );
}
