import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/lib/incrementalGame";
import { getOfficeGuidance } from "../src/lib/incrementalGuidance";

describe("office guidance", () => {
  it("teaches the first purchase before anything else", () => {
    const state = createInitialGameState(1_000);

    expect(getOfficeGuidance(state)).toMatchObject({
      title: "Commence ici",
      actionLabel: "Recrute ton premier stagiaire",
    });
  });

  it("teaches that ideas become money and reputation through the pitch", () => {
    const state = {
      ...createInitialGameState(1_000),
      workers: createInitialGameState(1_000).workers.map((worker) =>
        worker.id === "intern" ? { ...worker, count: 1 } : worker,
      ),
      resources: {
        ...createInitialGameState(1_000).resources,
        ideas: 25,
      },
    };

    expect(getOfficeGuidance(state)).toMatchObject({
      title: "Transforme tes idées",
      actionLabel: "Utilise Pitch client",
    });
  });
});
