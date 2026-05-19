import { describe, expect, it } from "vitest";
import {
  buildGainBubbleLabels,
  classifyLocationCard,
  classifyWorkerCard,
  diffResources,
} from "@/lib/incrementalPresentation";
import type { OfficeLocation, Resources, Worker } from "@/types/incremental";

const worker: Worker = {
  id: "intern",
  name: "Stagiaire",
  description: "",
  baseCost: 10,
  count: 0,
  level: 1,
  baseProduction: { ideas: 1 },
  unlockReputation: 0,
  emoji: "🧢",
  tags: [],
};

const location: OfficeLocation = {
  id: "coffee",
  name: "Machine à café",
  description: "",
  baseCost: 25,
  owned: false,
  level: 1,
  maxLevel: 3,
  effect: { ambianceBonus: 5 },
  unlockReputation: 20,
  emoji: "☕",
  tags: [],
};

describe("incremental presentation helpers", () => {
  it("marks affordable unlocked workers as strong cards", () => {
    expect(classifyWorkerCard(worker, 0, 50)).toBe("strong");
  });

  it("marks locked workers as quiet cards", () => {
    expect(classifyWorkerCard({ ...worker, unlockReputation: 40 }, 0, 50)).toBe("quiet");
  });

  it("marks locked locations as quiet cards", () => {
    expect(classifyLocationCard(location, 0, 50)).toBe("quiet");
  });

  it("returns only positive resource gains for floating feedback", () => {
    const before: Resources = { ideas: 0, budget: 10, ambiance: 50, reputation: 0, chaos: 0 };
    const after: Resources = { ideas: 12, budget: 5, ambiance: 50, reputation: 0, chaos: 5 };

    expect(diffResources(before, after)).toEqual({ ideas: 12, chaos: 5 });
  });

  it("formats gain bubble labels for readable feedback", () => {
    expect(buildGainBubbleLabels({ ideas: 12, reputation: 1.5 })).toEqual([
      "+12 idées",
      "+1,5 réputation",
    ]);
  });
});
