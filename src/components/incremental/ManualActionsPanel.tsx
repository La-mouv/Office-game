import { formatResourceEffect } from "@/lib/incrementalUi";
import type { ManualAction, OfficeLocation, Resources } from "@/types/incremental";

const ACTION_BUTTON_LABELS: Record<string, string> = {
  brainstorm: "Brainstormer",
  "coffee-break": "Pause café",
  "client-pitch": "Pitch client",
};

const ACTION_LABEL_FALLBACK = "Action";

function remainingCooldown(action: ManualAction, now: number): number {
  if (action.lastUsedAt === null) return 0;
  return Math.max(0, action.cooldownMs - (now - action.lastUsedAt));
}

function invertResourceEffect(effect: Partial<Resources>): Partial<Resources> {
  return (Object.entries(effect) as [keyof Resources, number][]).reduce<Partial<Resources>>(
    (inverted, [resource, amount]) => {
      inverted[resource] = -amount;
      return inverted;
    },
    {},
  );
}

export function ManualActionsPanel({
  actions,
  resources,
  locations,
  now,
  onUse,
  variant = "panel",
}: {
  actions: ManualAction[];
  resources: Resources;
  locations: OfficeLocation[];
  now: number;
  onUse: (actionId: string) => void;
  variant?: "panel" | "scene";
}) {
  const isScene = variant === "scene";

  return (
    <section className={isScene ? "office-action-wall" : "actions-panel space-y-3"}>
      {!isScene && (
        <div>
          <h2 className="text-xl font-black">Actions manuelles</h2>
          <p className="handwritten text-sm">Un petit coup de main pendant que le bureau tourne.</p>
        </div>
      )}

      <div className={isScene ? "office-action-grid" : "grid gap-3 md:grid-cols-2 xl:grid-cols-3"}>
        {actions.map((action) => {
          const remaining = remainingCooldown(action, now);
          const coffeeMachineOwned = locations.some(
            (location) => location.id === "coffee-machine" && location.owned,
          );
          const requiresCoffeeMachine = action.id === "coffee-break" && !coffeeMachineOwned;
          const affordable = Object.entries(action.cost ?? {}).every(
            ([resource, amount]) => resources[resource as keyof Resources] >= (amount ?? 0),
          );
          const disabled = requiresCoffeeMachine || remaining > 0 || !affordable;
          const buttonLabel =
            requiresCoffeeMachine
              ? "Machine à café requise"
              : remaining > 0
                ? `${Math.ceil(remaining / 1000)} s`
                : (ACTION_BUTTON_LABELS[action.id] ?? ACTION_LABEL_FALLBACK);

          return (
            <article
              key={action.id}
              className={`quick-action-card ${disabled ? "quick-action-disabled" : ""}`}
            >
              <span className="text-2xl">{action.emoji}</span>
              <div className="quick-action-deltas">
                {action.cost && <span>{formatResourceEffect(invertResourceEffect(action.cost))}</span>}
                <span>{formatResourceEffect(action.effect)}</span>
              </div>
              <button
                type="button"
                disabled={disabled}
                className="quick-action-state"
                onClick={() => onUse(action.id)}
              >
                {buttonLabel}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
