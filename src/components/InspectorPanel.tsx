import { formatResourceDelta } from "@/lib/ui";
import type { GameCard, GameState, PlacedCard } from "@/types/game";

type InspectorPanelProps = {
  state: GameState;
  handCard?: GameCard;
  placedCard?: PlacedCard;
  connectionSourceId?: string;
  onPlay: () => void;
  onStore: () => void;
  onUse: () => void;
  onConnect: () => void;
  onUpgrade: () => void;
};

export function InspectorPanel({
  state,
  handCard,
  placedCard,
  connectionSourceId,
  onPlay,
  onStore,
  onUse,
  onConnect,
  onUpgrade,
}: InspectorPanelProps) {
  const card = handCard ?? placedCard;

  if (!card) {
    return (
      <aside className="space-y-4">
        <div className="paper-note">
          <h2 className="font-black">Objectif</h2>
          <p className="handwritten mt-2">
            Atteins 250 de réputation et termine le Grand Projet final.
          </p>
        </div>
        <div className="paper-note">
          <h2 className="font-black">Règles rapides</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>Pose des cartes pour produire.</li>
            <li>Relie-les avec des post-its.</li>
            <li>Garde bonheur haut et stress bas.</li>
          </ul>
        </div>
        <div className="paper-note">
          <h2 className="font-black">Dernier événement</h2>
          <p className="handwritten mt-2">
            {state.currentEvent?.name ?? "Aucun événement pour le moment."}
          </p>
        </div>
      </aside>
    );
  }

  const isHandObject = handCard?.type === "object";

  return (
    <aside className="space-y-4">
      <div className="paper-card overflow-hidden">
        <div className="border-b-[3px] border-black bg-white p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-4xl">{card.imageEmoji}</p>
              <h2 className="mt-2 text-xl font-black">{card.name}</h2>
            </div>
            <span className="rounded-full border-2 border-black bg-[var(--yellow)] px-2 py-1 text-xs font-bold">
              Niv. {card.level}
            </span>
          </div>
          <p className="handwritten mt-3 text-sm">{card.description}</p>
        </div>
        <div className="space-y-2 p-4 text-sm">
          <p>
            <strong>Coût :</strong> {formatResourceDelta(card.cost)}
          </p>
          <p>
            <strong>Production :</strong> {formatResourceDelta(card.production)}
          </p>
          <p>
            <strong>Effet :</strong> {formatResourceDelta(card.instantEffect)}
          </p>
          {placedCard && (
            <p>
              <strong>Connexions :</strong> {placedCard.connectedTo.length}/
              {placedCard.connectionsMax ?? "∞"}
            </p>
          )}
        </div>
      </div>

      {handCard && (
        <div className="grid gap-2">
          {(!isHandObject || handCard.production || handCard.instantEffect) && (
            <button type="button" className="paper-button bg-[var(--blue)]" onClick={onPlay}>
              ▶ Jouer
            </button>
          )}
          {isHandObject && (
            <>
              {handCard.instantEffect && (
                <button type="button" className="paper-button bg-[var(--yellow)]" onClick={onUse}>
                  ✨ Utiliser
                </button>
              )}
              <button type="button" className="paper-button bg-[var(--mint)]" onClick={onStore}>
                🎒 Stocker
              </button>
            </>
          )}
        </div>
      )}

      {placedCard && (
        <div className="grid gap-2">
          <button
            type="button"
            className={`paper-button ${
              connectionSourceId === placedCard.instanceId ? "bg-[var(--yellow)]" : "bg-white"
            }`}
            onClick={onConnect}
          >
            🔗 {connectionSourceId === placedCard.instanceId ? "Choisis une cible" : "Connecter"}
          </button>
          <button type="button" className="paper-button bg-[var(--mint)]" onClick={onUpgrade}>
            ⬆ Améliorer
          </button>
        </div>
      )}
    </aside>
  );
}
