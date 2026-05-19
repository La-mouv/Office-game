import type { GameCard } from "@/types/game";

export function EventBanner({ event }: { event?: GameCard }) {
  if (!event) return null;

  return (
    <div className="paper-card flex items-center gap-3 bg-[var(--pink)] px-4 py-3">
      <span className="text-2xl">{event.imageEmoji}</span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide">Événement du jour</p>
        <p className="font-bold">{event.name}</p>
      </div>
    </div>
  );
}
