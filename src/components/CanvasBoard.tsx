import { GameCard } from "@/components/GameCard";
import type { GameState, PlacedCard } from "@/types/game";

type CanvasBoardProps = {
  state: GameState;
  selectedPlacedId?: string;
  connectionSourceId?: string;
  onBoardClick: (x: number, y: number) => void;
  onPlacedCardClick: (card: PlacedCard) => void;
};

export function CanvasBoard({
  state,
  selectedPlacedId,
  connectionSourceId,
  onBoardClick,
  onPlacedCardClick,
}: CanvasBoardProps) {
  const connections = state.placedCards.flatMap((card) =>
    card.connectedTo
      .filter((targetId) => card.instanceId < targetId)
      .map((targetId) => {
        const target = state.placedCards.find((candidate) => candidate.instanceId === targetId);
        return target ? { source: card, target } : null;
      })
      .filter(Boolean),
  ) as { source: PlacedCard; target: PlacedCard }[];

  return (
    <section
      className="relative min-h-[520px] overflow-hidden rounded-[24px] border-[3px] border-black bg-[var(--background)] bg-[radial-gradient(var(--grid)_1px,transparent_1px)] [background-size:24px_24px]"
      onClick={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        onBoardClick(event.clientX - bounds.left, event.clientY - bounds.top);
      }}
    >
      {state.placedCards.length === 0 && (
        <div className="absolute inset-0 grid place-items-center text-center">
          <p className="handwritten text-xl">Clique ici pour poser une première carte.</p>
        </div>
      )}

      <svg className="pointer-events-none absolute inset-0 h-full w-full">
        {connections.map(({ source, target }) => {
          const startX = source.x + 88;
          const startY = source.y + 82;
          const endX = target.x + 88;
          const endY = target.y + 82;
          const controlX = (startX + endX) / 2;
          const controlY = Math.min(startY, endY) - 60;

          return (
            <path
              key={`${source.instanceId}-${target.instanceId}`}
              d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
              fill="none"
              stroke="#111111"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="10 6"
            />
          );
        })}
      </svg>

      {state.placedCards.map((card) => (
        <div
          key={card.instanceId}
          className="absolute"
          style={{ left: card.x, top: card.y }}
          onClick={(event) => {
            event.stopPropagation();
            onPlacedCardClick(card);
          }}
        >
          <GameCard
            card={card}
            compact
            selected={
              selectedPlacedId === card.instanceId || connectionSourceId === card.instanceId
            }
          />
        </div>
      ))}

      {state.pendingPlacement && (
        <div className="pointer-events-none absolute inset-x-6 bottom-6 rounded-2xl border-[3px] border-black bg-white px-4 py-3 font-bold shadow-[5px_5px_0_rgba(17,17,17,0.14)]">
          Clique sur le plateau pour placer {state.pendingPlacement.name}.
        </div>
      )}
    </section>
  );
}
