import { CARD_TYPE_LABELS, CARD_TYPE_STYLES, formatResourceDelta } from "@/lib/ui";
import type { GameCard as GameCardType, PlacedCard } from "@/types/game";

type GameCardComponentProps = {
  card: GameCardType | PlacedCard;
  selected?: boolean;
  compact?: boolean;
  onClick?: () => void;
};

export function GameCard({
  card,
  selected = false,
  compact = false,
  onClick,
}: GameCardComponentProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`paper-card text-left transition-transform ${
        selected ? "-translate-y-1 ring-4 ring-black/10" : "hover:-translate-y-1"
      } ${compact ? "w-44" : "w-52"}`}
    >
      <div
        className={`border-b-[3px] border-black px-3 py-2 text-sm font-bold ${CARD_TYPE_STYLES[card.type]}`}
      >
        <div className="flex items-center justify-between gap-2">
          <span>{card.name}</span>
          <span className="rounded-full border-2 border-black bg-white px-2 py-0.5 text-xs">
            Niv. {card.level}
          </span>
        </div>
      </div>
      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between">
          <span className="text-4xl">{card.imageEmoji ?? "🃏"}</span>
          <span className="rounded-full border-2 border-black bg-white px-2 py-1 text-[11px] font-bold">
            {CARD_TYPE_LABELS[card.type]}
          </span>
        </div>
        {!compact && (
          <>
            <p className="handwritten text-sm leading-snug">{card.description}</p>
            <div className="space-y-1 text-xs">
              <p>
                <span className="font-bold">Coût :</span> {formatResourceDelta(card.cost)}
              </p>
              <p>
                <span className="font-bold">Production :</span>{" "}
                {formatResourceDelta(card.production ?? card.instantEffect)}
              </p>
            </div>
          </>
        )}
        <div className="flex flex-wrap gap-1">
          {card.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-black bg-white px-2 py-0.5 text-[10px]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
