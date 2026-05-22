import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SkillCard } from "@/components/incremental/OfficeShopPanel";
import { SynergiesView } from "@/components/incremental/SynergiesView";
import { UpgradesView } from "@/components/incremental/UpgradesView";
import { createInitialGameState } from "@/lib/incrementalGame";
import { getOfficeGuidance } from "@/lib/incrementalGuidance";
import { getEligibleDynamicMissions } from "@/lib/incrementalMissions";
import { MILESTONES, SKILLS } from "@/lib/incrementalData";
import type { GameState } from "@/types/incremental";

function textFrom(parts: string[]): string {
  return parts.join(" ");
}

function withTutorialDone(state: GameState): GameState {
  return {
    ...state,
    activeMission: null,
    completedMissionIds: [
      "guided-first-intern",
      "guided-first-ideas",
      "guided-first-pitch",
      "guided-coffee-machine",
      "guided-first-skill",
    ],
  };
}

describe("incremental copy consistency", () => {
  it("uses combo and talent wording instead of the old synergy or upgrade labels", () => {
    const state = withTutorialDone({
      ...createInitialGameState(0),
      resources: {
        ...createInitialGameState(0).resources,
        reputation: 100,
      },
      talentPoints: 1,
    });
    const dynamicMissionCopy = textFrom(
      getEligibleDynamicMissions(state).flatMap((mission) => [
        mission.title,
        mission.description,
        mission.reward.boost?.description ?? "",
      ]),
    );
    const guidanceStates = [
      createInitialGameState(0),
      {
        ...createInitialGameState(0),
        workers: createInitialGameState(0).workers.map((worker) =>
          worker.id === "intern" ? { ...worker, count: 1 } : worker,
        ),
        totalReputationEarned: 30,
        resources: { ...createInitialGameState(0).resources, reputation: 30 },
      },
      {
        ...createInitialGameState(0),
        workers: createInitialGameState(0).workers.map((worker) =>
          worker.id === "intern"
            ? { ...worker, count: 1 }
            : worker.id === "tired-dev"
              ? { ...worker, count: 1 }
              : worker,
        ),
        locations: createInitialGameState(0).locations.map((location) =>
          location.id === "coffee-machine" ? { ...location, owned: true } : location,
        ),
        totalReputationEarned: 60,
      },
    ];
    const guidanceCopy = textFrom(
      guidanceStates.flatMap((candidate) => {
        const guidance = getOfficeGuidance(candidate);
        return [guidance.title, guidance.actionLabel, guidance.description];
      }),
    );
    const milestoneCopy = textFrom(
      MILESTONES.flatMap((milestone) => [milestone.title, milestone.description]),
    );
    const dormantViewsCopy = renderToStaticMarkup(
      <>
        <SynergiesView state={state} />
        <UpgradesView
          state={state}
          onUnlockSkill={vi.fn()}
          onBuyWorker={vi.fn()}
          onUpgradeWorker={vi.fn()}
          onBuyOrUpgradeLocation={vi.fn()}
        />
      </>,
    );

    const visibleCopy = textFrom([dynamicMissionCopy, guidanceCopy, milestoneCopy, dormantViewsCopy]);

    expect(visibleCopy).toContain("combo");
    expect(visibleCopy).toMatch(/talent/i);
    expect(visibleCopy).not.toMatch(/synergie|synergies|synergique/i);
    expect(visibleCopy).not.toMatch(/upgrade|upgrades/i);
    expect(visibleCopy).not.toMatch(/Débloque [A-ZÉ]/);
  });

  it("keeps development talent copy away from production labels and pluralizes talent prices", () => {
    const state = createInitialGameState(0);
    const multiTalentSkill = SKILLS.find((skill) => skill.cost > 1);

    expect(multiTalentSkill).toBeDefined();
    const skillCopy = textFrom(SKILLS.map((skill) => skill.description));
    const html = renderToStaticMarkup(
      <SkillCard skill={multiTalentSkill!} state={state} onUnlock={vi.fn()} />,
    );

    expect(skillCopy).not.toMatch(/production globale/i);
    expect(html).toContain(`Acheter ${multiTalentSkill!.cost} talents`);
  });
});
