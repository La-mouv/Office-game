import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { GAME_ASSET_PATHS, type GameAssetId } from "@/lib/gameAssets";
import {
  ACTION_ASSET_IDS,
  INCIDENT_ASSET_IDS,
  LOCATION_ASSET_IDS,
  MILESTONE_ASSET_IDS,
  RESOURCE_ASSET_IDS,
  SKILL_ASSET_IDS,
  SYNERGY_ASSET_IDS,
  WORKER_ASSET_IDS,
} from "@/lib/incrementalAssets";
import {
  INCIDENTS,
  LOCATIONS,
  MANUAL_ACTIONS,
  MILESTONES,
  SKILLS,
  SYNERGIES,
  WORKERS,
} from "@/lib/incrementalData";
import type { Resources } from "@/types/incremental";

const assetMaps = [
  WORKER_ASSET_IDS,
  LOCATION_ASSET_IDS,
  ACTION_ASSET_IDS,
  SKILL_ASSET_IDS,
  SYNERGY_ASSET_IDS,
  MILESTONE_ASSET_IDS,
  INCIDENT_ASSET_IDS,
  RESOURCE_ASSET_IDS,
];

function expectEveryIdMapped(ids: string[], map: Partial<Record<string, GameAssetId>>) {
  expect(ids.filter((id) => !map[id])).toEqual([]);
}

describe("game assets", () => {
  it("maps every current game card and picto to an extracted asset", () => {
    expectEveryIdMapped(WORKERS.map((worker) => worker.id), WORKER_ASSET_IDS);
    expectEveryIdMapped(LOCATIONS.map((location) => location.id), LOCATION_ASSET_IDS);
    expectEveryIdMapped(MANUAL_ACTIONS.map((action) => action.id), ACTION_ASSET_IDS);
    expectEveryIdMapped(SKILLS.map((skill) => skill.id), SKILL_ASSET_IDS);
    expectEveryIdMapped(SYNERGIES.map((synergy) => synergy.id), SYNERGY_ASSET_IDS);
    expectEveryIdMapped(MILESTONES.map((milestone) => milestone.id), MILESTONE_ASSET_IDS);
    expectEveryIdMapped(INCIDENTS.map((incident) => incident.id), INCIDENT_ASSET_IDS);
    expectEveryIdMapped(
      ["ideas", "budget", "ambiance", "reputation", "chaos"] satisfies (keyof Resources)[],
      RESOURCE_ASSET_IDS,
    );
  });

  it("only references PNG files that exist in public/game-assets", () => {
    const referencedAssetIds = new Set<GameAssetId>(assetMaps.flatMap((map) => Object.values(map)));

    expect([...referencedAssetIds].filter((assetId) => !GAME_ASSET_PATHS[assetId])).toEqual([]);
    expect(
      [...referencedAssetIds].filter((assetId) => {
        const publicPath = GAME_ASSET_PATHS[assetId].replace(/^\//, "");
        return !existsSync(join(process.cwd(), "public", publicPath.replace(/^public\//, "")));
      }),
    ).toEqual([]);
  });
});
