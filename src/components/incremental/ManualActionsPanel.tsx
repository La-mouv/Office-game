import { formatResourceEffect } from "@/lib/incrementalUi";
import { GameAssetImage } from "@/components/incremental/GameAssetImage";
import { getActionAssetId } from "@/lib/incrementalAssets";
import type { GameLanguage } from "@/lib/gameTranslations";
import type { ManualAction, OfficeLocation, Resources } from "@/types/incremental";

const ACTION_BUTTON_LABELS: Record<GameLanguage, Record<string, string>> = {
  fr: {
    brainstorm: "Brainstormer",
    "coffee-break": "Pause café",
    "client-pitch": "Pitch client",
  },
  en: {
    brainstorm: "Brainstorm",
    "coffee-break": "Coffee break",
    "client-pitch": "Client pitch",
  },
  es: {
    brainstorm: "Brainstorming",
    "coffee-break": "Pausa café",
    "client-pitch": "Pitch cliente",
  },
};

const ACTION_LABEL_FALLBACK: Record<GameLanguage, string> = {
  fr: "Action",
  en: "Action",
  es: "Acción",
};

const COFFEE_MACHINE_REQUIRED: Record<GameLanguage, string> = {
  fr: "Machine à café requise",
  en: "Coffee machine required",
  es: "Máquina de café requerida",
};

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
  language = "fr",
  highlighted = false,
}: {
  actions: ManualAction[];
  resources: Resources;
  locations: OfficeLocation[];
  now: number;
  onUse: (actionId: string) => void;
  variant?: "panel" | "scene";
  language?: GameLanguage;
  highlighted?: boolean;
}) {
  const isScene = variant === "scene";

  return (
    <section
      className={`${isScene ? "office-action-wall" : "actions-panel space-y-3"} ${
        highlighted ? "tutorial-target-active" : ""
      }`.trim()}
    >
      {!isScene && (
        <div>
          <h2 className="text-xl font-black">
            {language === "en" ? "Manual actions" : language === "es" ? "Acciones manuales" : "Actions manuelles"}
          </h2>
          <p className="handwritten text-sm">
            {language === "en"
              ? "A quick hand while the office keeps spinning."
              : language === "es"
                ? "Una ayuda rápida mientras la oficina sigue girando."
                : "Un petit coup de main pendant que le bureau tourne."}
          </p>
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
              ? COFFEE_MACHINE_REQUIRED[language]
              : remaining > 0
                ? `${Math.ceil(remaining / 1000)} s`
                : (ACTION_BUTTON_LABELS[language][action.id] ?? ACTION_LABEL_FALLBACK[language]);

          return (
            <article
              key={action.id}
              className={`quick-action-card ${disabled ? "quick-action-disabled" : ""}`}
            >
              <div className="quick-action-main">
                <GameAssetImage
                  assetId={getActionAssetId(action.id)}
                  alt=""
                  className="quick-action-asset"
                />
                <div className="quick-action-deltas">
                  {action.cost && <span>{formatResourceEffect(invertResourceEffect(action.cost), language)}</span>}
                  <span>{formatResourceEffect(action.effect, language)}</span>
                </div>
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
