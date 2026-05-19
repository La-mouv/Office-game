import type { Resources } from "@/types/incremental";

export const RESOURCE_LABELS: Record<keyof Resources, string> = {
  ideas: "Idées",
  budget: "Budget",
  ambiance: "Ambiance",
  reputation: "Réputation",
  chaos: "Chaos",
};

export const RESOURCE_EMOJIS: Record<keyof Resources, string> = {
  ideas: "💡",
  budget: "💶",
  ambiance: "😊",
  reputation: "⭐",
  chaos: "🌀",
};

export function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return value.toLocaleString("fr-FR", { maximumFractionDigits: 0 });
  }
  if (value >= 100) {
    return value.toLocaleString("fr-FR", { maximumFractionDigits: 0 });
  }
  return value.toLocaleString("fr-FR", {
    maximumFractionDigits: value % 1 === 0 ? 0 : 1,
  });
}

export function formatPerSecond(value: number | undefined): string {
  return `+${formatNumber(value ?? 0)}/s`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)} %`;
}

export function formatResourceEffect(effect: Partial<Resources>): string {
  const entries = (Object.entries(effect) as [keyof Resources, number][]).filter(
    ([, amount]) => Math.abs(amount) > 0.0001,
  );
  if (entries.length === 0) return "—";

  return entries
    .map(([resource, amount]) => {
      const sign = amount > 0 ? "+" : "";
      return `${sign}${formatNumber(amount)} ${RESOURCE_LABELS[resource].toLowerCase()}`;
    })
    .join(" · ");
}
