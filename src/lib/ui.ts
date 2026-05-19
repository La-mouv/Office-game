import type { GameCard, Resources } from "@/types/game";

export const CARD_TYPE_STYLES = {
  person: "bg-[var(--purple)]",
  building: "bg-[var(--blue)]",
  object: "bg-[var(--mint)]",
  action: "bg-[var(--yellow-soft)]",
  event: "bg-[var(--pink)]",
  project: "bg-[var(--orange)]",
  resource: "bg-white",
} satisfies Record<GameCard["type"], string>;

export const CARD_TYPE_LABELS: Record<GameCard["type"], string> = {
  person: "Personnage",
  building: "Bâtiment",
  object: "Objet",
  action: "Action",
  event: "Événement",
  project: "Projet",
  resource: "Ressource",
};

export const RESOURCE_LABELS: Record<keyof Resources, string> = {
  ideas: "Idées",
  energy: "Énergie",
  budget: "Budget",
  happiness: "Bonheur",
  reputation: "Réputation",
  stress: "Stress",
  postIts: "Post-its",
  talentPoints: "Talent",
};

export const RESOURCE_EMOJIS: Record<keyof Resources, string> = {
  ideas: "💡",
  energy: "⚡",
  budget: "💶",
  happiness: "😊",
  reputation: "⭐",
  stress: "😵",
  postIts: "🗒️",
  talentPoints: "🌱",
};

export function formatResourceDelta(delta?: Partial<Resources>): string {
  if (!delta || Object.keys(delta).length === 0) return "—";

  return Object.entries(delta)
    .map(([resource, amount]) => {
      const sign = (amount ?? 0) > 0 ? "+" : "";
      return `${sign}${amount} ${RESOURCE_LABELS[resource as keyof Resources].toLowerCase()}`;
    })
    .join(" · ");
}
