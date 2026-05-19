import { GameCard } from "@/components/GameCard";
import type { GameCard as GameCardType } from "@/types/game";

type HandBarProps = {
  hand: GameCardType[];
  selectedCardId?: string;
  onSelect: (cardId: string) => void;
  onPlay: () => void;
  onDiscard: () => void;
  onEndDay: () => void;
};

export function HandBar({
  hand,
  selectedCardId,
  onSelect,
  onPlay,
  onDiscard,
  onEndDay,
}: HandBarProps) {
  return (
    <section className="space-y-3 border-t-[3px] border-black bg-white/90 p-4">
      <div className="flex flex-wrap gap-3 overflow-x-auto pb-1">
        {hand.map((card, index) => (
          <GameCard
            key={`${card.id}-${index}`}
            card={card}
            compact
            selected={selectedCardId === card.id}
            onClick={() => onSelect(card.id)}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="paper-button bg-[var(--blue)]" onClick={onPlay}>
          ▶ Jouer
        </button>
        <button type="button" className="paper-button bg-white" onClick={onDiscard}>
          🗑 Défausser
        </button>
        <button
          type="button"
          className="paper-button ml-auto bg-[var(--yellow)]"
          onClick={onEndDay}
        >
          🌙 Finir la journée
        </button>
      </div>
    </section>
  );
}
