# Office Village UI Vitality Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Office Village screen into a more game-like three-zone interface with a compact header, a larger living office scene, a unified right-side shop, stronger quick actions, a clearer incident panel, and a quieter journal, while preserving all existing gameplay logic.

**Architecture:** Keep the current incremental game engine untouched and add only presentational state around it. The left navigation remains in `IncrementalSidebar`, the center play area is reorganized inside `OfficeView`, and a new focused `OfficeShopPanel` owns the right-side shop tabs so workers, locations, and skills can be displayed compactly without changing their underlying data or purchase functions. Transient visual feedback such as gain bubbles and short ambiance/chaos reactions stays in the shell and preview components only.

**Tech Stack:** Next.js 16 App Router, React 19 client components, TypeScript, Tailwind CSS utilities, shared global CSS, Vitest, in-app browser verification.

---

## File map

- Modify `src/components/incremental/IncrementalGameShell.tsx`
  - pass skill purchases into the office view;
  - hold only transient scene-reaction state for ambiance / chaos feedback.
- Modify `src/components/incremental/IncrementalResourceBar.tsx`
  - compact the header and modernize the two meters.
- Modify `src/components/incremental/IncrementalSidebar.tsx`
  - reduce it to a simpler left navigation rail.
- Modify `src/components/incremental/OfficeView.tsx`
  - change the office page into center-content + right-shop layout.
- Create `src/components/incremental/OfficeShopPanel.tsx`
  - own the `Personnages / Lieux / Upgrades` tabs and compact right-rail cards.
- Modify `src/components/incremental/OfficeVillagePreview.tsx`
  - become the large office scene with object tiles, worker avatars, and ambiance / chaos reaction classes.
- Modify `src/components/incremental/ManualActionsPanel.tsx`
  - turn actions into larger, more satisfying quick-action buttons.
- Modify `src/components/incremental/IncidentPanel.tsx`
  - promote incidents into stronger game events.
- Modify `src/components/GameLog.tsx`
  - limit the visible feed to recent entries and add a compact collapsible presentation.
- Modify `src/components/incremental/OfficeGuidanceCard.tsx`
  - keep mission emphasis strong but visually cleaner.
- Modify `src/app/globals.css`
  - soften paper borders, add the needed scene effects, hover states, and reduced-motion fallbacks.
- Modify `src/lib/incrementalPresentation.ts`
  - add small pure helpers for recent-log slicing and scene reaction classification.
- Add `tests/officeShopPanel.test.tsx`
  - verify the new shop defaults and tab labeling.
- Add `tests/incrementalScenePresentation.test.ts`
  - verify the new pure helpers.
- Modify `tests/gameLog.test.tsx`
  - verify compact recent-entry behavior.
- Modify `progress.md`
  - record the UI iteration and verification notes.

## Task 1: Add pure presentation helpers for the new layout

**Files:**
- Modify: `src/lib/incrementalPresentation.ts`
- Add: `tests/incrementalScenePresentation.test.ts`
- Modify: `tests/gameLog.test.tsx`

- [ ] **Step 1: Write failing tests for scene reactions and recent-log slicing**

Create `tests/incrementalScenePresentation.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  getRecentLogEntries,
  getSceneReaction,
} from "@/lib/incrementalPresentation";
import type { Resources } from "@/types/incremental";

describe("incremental scene presentation", () => {
  it("prefers a chaos reaction when chaos rises", () => {
    const before: Resources = { ideas: 0, budget: 0, ambiance: 50, reputation: 0, chaos: 5 };
    const after: Resources = { ideas: 0, budget: 0, ambiance: 55, reputation: 0, chaos: 8 };

    expect(getSceneReaction(before, after)).toBe("chaos");
  });

  it("returns an ambiance reaction when ambiance rises alone", () => {
    const before: Resources = { ideas: 0, budget: 0, ambiance: 50, reputation: 0, chaos: 5 };
    const after: Resources = { ideas: 0, budget: 0, ambiance: 55, reputation: 0, chaos: 5 };

    expect(getSceneReaction(before, after)).toBe("ambiance");
  });

  it("keeps only the latest journal entries for the compact feed", () => {
    expect(getRecentLogEntries(["a", "b", "c", "d", "e"], 3)).toEqual(["c", "d", "e"]);
  });
});
```

Extend `tests/gameLog.test.tsx` with:

```ts
import { getRecentLogEntries } from "@/lib/incrementalPresentation";

it("keeps only the latest visible journal lines for the compact panel", () => {
  expect(getRecentLogEntries(["1", "2", "3", "4", "5"], 4)).toEqual(["2", "3", "4", "5"]);
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
npm test -- tests/incrementalScenePresentation.test.ts tests/gameLog.test.tsx
```

Expected: FAIL because `getSceneReaction` and `getRecentLogEntries` do not exist yet.

- [ ] **Step 3: Add the minimal helper implementations**

Append to `src/lib/incrementalPresentation.ts`:

```ts
export type SceneReaction = "ambiance" | "chaos" | null;

export function getSceneReaction(before: Resources, after: Resources): SceneReaction {
  if (after.chaos > before.chaos) return "chaos";
  if (after.ambiance > before.ambiance) return "ambiance";
  return null;
}

export function getRecentLogEntries(entries: string[], limit = 4): string[] {
  return entries.slice(-limit);
}
```

- [ ] **Step 4: Re-run the focused tests and verify GREEN**

Run:

```bash
npm test -- tests/incrementalScenePresentation.test.ts tests/gameLog.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/incrementalPresentation.ts tests/incrementalScenePresentation.test.ts tests/gameLog.test.tsx
git commit -m "feat: add office scene presentation helpers"
```

## Task 2: Build the unified right-side shop

**Files:**
- Add: `src/components/incremental/OfficeShopPanel.tsx`
- Add: `tests/officeShopPanel.test.tsx`
- Modify: `src/components/incremental/OfficeView.tsx`
- Modify: `src/components/incremental/IncrementalGameShell.tsx`

- [ ] **Step 1: Write the failing shop render test**

Create `tests/officeShopPanel.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { OfficeShopPanel } from "@/components/incremental/OfficeShopPanel";
import { createInitialGameState } from "@/lib/incrementalGame";

describe("OfficeShopPanel", () => {
  it("renders the compact shop with all three tab labels and workers by default", () => {
    const html = renderToStaticMarkup(
      <OfficeShopPanel
        state={createInitialGameState(0)}
        onBuyWorker={vi.fn()}
        onUpgradeWorker={vi.fn()}
        onBuyOrUpgradeLocation={vi.fn()}
        onUnlockSkill={vi.fn()}
      />,
    );

    expect(html).toContain("Boutique");
    expect(html).toContain("Personnages");
    expect(html).toContain("Lieux");
    expect(html).toContain("Upgrades");
    expect(html).toContain("Stagiaire motivé");
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- tests/officeShopPanel.test.tsx
```

Expected: FAIL because `OfficeShopPanel` does not exist yet.

- [ ] **Step 3: Implement the minimal shop component**

Create `src/components/incremental/OfficeShopPanel.tsx`:

```tsx
"use client";

import { useState } from "react";
import { formatNumber } from "@/lib/incrementalUi";
import { LocationCard } from "@/components/incremental/LocationCard";
import { WorkerCard } from "@/components/incremental/WorkerCard";
import type { GameState, Skill } from "@/types/incremental";

type ShopTab = "workers" | "locations" | "upgrades";

const SHOP_TABS: { id: ShopTab; label: string }[] = [
  { id: "workers", label: "Personnages" },
  { id: "locations", label: "Lieux" },
  { id: "upgrades", label: "Upgrades" },
];

export function OfficeShopPanel({
  state,
  onBuyWorker,
  onUpgradeWorker,
  onBuyOrUpgradeLocation,
  onUnlockSkill,
}: {
  state: GameState;
  onBuyWorker: (workerId: string) => void;
  onUpgradeWorker: (workerId: string) => void;
  onBuyOrUpgradeLocation: (locationId: string) => void;
  onUnlockSkill: (skillId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<ShopTab>("workers");

  function renderSkill(skill: Skill) {
    const locked = state.resources.reputation < skill.unlockReputation;
    const disabled = locked || skill.unlocked || state.talentPoints < skill.cost;

    return (
      <article key={skill.id} className="shop-card shop-card-upgrade">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xl">{skill.emoji}</p>
            <h3 className="font-black">{skill.name}</h3>
          </div>
          <span className="paper-pill">🌱 {skill.cost}</span>
        </div>
        <p className="handwritten mt-2 text-sm">{skill.description}</p>
        {locked && (
          <p className="mt-2 text-xs font-bold">
            🔒 {formatNumber(skill.unlockReputation)} réputation requise
          </p>
        )}
        <button
          type="button"
          disabled={disabled}
          className="paper-button mt-3 w-full bg-white disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => onUnlockSkill(skill.id)}
        >
          {skill.unlocked ? "Débloqué" : "Débloquer"}
        </button>
      </article>
    );
  }

  return (
    <aside className="paper-note shop-panel space-y-3">
      <h2 className="text-xl font-black">🛍️ Boutique</h2>
      <div className="grid grid-cols-3 gap-2">
        {SHOP_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`shop-tab ${activeTab === tab.id ? "shop-tab-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {activeTab === "workers" &&
          state.workers.map((worker) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              reputation={state.resources.reputation}
              budget={state.resources.budget}
              onBuy={() => onBuyWorker(worker.id)}
              onUpgrade={() => onUpgradeWorker(worker.id)}
            />
          ))}

        {activeTab === "locations" &&
          state.locations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              reputation={state.resources.reputation}
              budget={state.resources.budget}
              onBuyOrUpgrade={() => onBuyOrUpgradeLocation(location.id)}
            />
          ))}

        {activeTab === "upgrades" && state.skills.map(renderSkill)}
      </div>
    </aside>
  );
}
```

- [ ] **Step 4: Mount the shop inside the office page**

Update `src/components/incremental/OfficeView.tsx`:

```tsx
import { OfficeShopPanel } from "@/components/incremental/OfficeShopPanel";

export function OfficeView({
  state,
  now,
  gainBubbles,
  missionPulseKey,
  sceneReaction,
  onBuyWorker,
  onUpgradeWorker,
  onBuyOrUpgradeLocation,
  onUnlockSkill,
  onUseManualAction,
  onResolveIncident,
}: {
  // existing props...
  sceneReaction: "ambiance" | "chaos" | null;
  onUnlockSkill: (skillId: string) => void;
}) {
  return (
    <div className="office-layout">
      <div className="space-y-4">
        <OfficeVillagePreview state={state} gainBubbles={gainBubbles} sceneReaction={sceneReaction} />
        <OfficeGuidanceCard state={state} now={now} missionPulseKey={missionPulseKey} />
        <ManualActionsPanel
          actions={state.manualActions}
          resources={state.resources}
          now={now}
          onUse={onUseManualAction}
        />
        <div className="grid gap-4 lg:grid-cols-[minmax(320px,0.95fr)_minmax(260px,0.65fr)]">
          <IncidentPanel incident={state.activeIncident} onResolve={onResolveIncident} />
          <GameLog entries={state.log} />
        </div>
      </div>

      <OfficeShopPanel
        state={state}
        onBuyWorker={onBuyWorker}
        onUpgradeWorker={onUpgradeWorker}
        onBuyOrUpgradeLocation={onBuyOrUpgradeLocation}
        onUnlockSkill={onUnlockSkill}
      />
    </div>
  );
}
```

Update `src/components/incremental/IncrementalGameShell.tsx`:

```tsx
const [sceneReaction, setSceneReaction] = useState<"ambiance" | "chaos" | null>(null);

// inside runAtCurrentTime
const nextReaction = getSceneReaction(current.resources, next.resources);
if (nextReaction) {
  setSceneReaction(nextReaction);
  window.setTimeout(() => setSceneReaction(null), 700);
}

<OfficeView
  // existing props...
  sceneReaction={sceneReaction}
  onUnlockSkill={(skillId) =>
    runAtCurrentTime((current, timestamp) => unlockSkill(current, skillId, timestamp))
  }
/>
```

- [ ] **Step 5: Re-run the focused test and verify GREEN**

Run:

```bash
npm test -- tests/officeShopPanel.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/incremental/OfficeShopPanel.tsx src/components/incremental/OfficeView.tsx src/components/incremental/IncrementalGameShell.tsx tests/officeShopPanel.test.tsx
git commit -m "feat: add unified office shop panel"
```

## Task 3: Compact the top bar and simplify the left navigation

**Files:**
- Modify: `src/components/incremental/IncrementalResourceBar.tsx`
- Modify: `src/components/incremental/IncrementalSidebar.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add the compact header markup**

Update the outer classes in `IncrementalResourceBar`:

```tsx
<header className="resource-header">
  <div className="resource-header-top">
    <div className="game-title-chip">
      <span>🏢</span>
      <strong>Office Village</strong>
    </div>
    <div className="resource-pill-row">
      {/* existing idées / budget / réputation / talent pills */}
    </div>
  </div>
  <div className="resource-meter-row">
    {/* existing ambiance and chaos meters */}
  </div>
</header>
```

- [ ] **Step 2: Reduce the sidebar to a navigation rail**

Update `IncrementalSidebar` so the visible default state keeps only:

```tsx
<aside className="office-sidebar">
  <p className="sidebar-label">Navigation</p>
  <nav className="grid gap-2">{/* Bureau / Upgrades / Réussites */}</nav>
  <button type="button" className="paper-button mt-auto justify-start bg-white" onClick={() => setMenuOpen(true)}>
    ☰ Menu
  </button>
</aside>
```

Remove the duplicated large `Office Village` title block from the sidebar body because the title now lives in the header.

- [ ] **Step 3: Add the supporting CSS**

Append to `src/app/globals.css`:

```css
.resource-header {
  border-bottom: 2px solid rgba(17, 17, 17, 0.16);
  background: var(--background);
  padding: 0.75rem 1rem;
}

.resource-header-top,
.resource-pill-row,
.resource-meter-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.resource-header-top {
  flex-wrap: wrap;
}

.resource-pill-row {
  flex: 1;
  flex-wrap: wrap;
}

.resource-meter-row {
  margin-top: 0.65rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.game-title-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 999px;
  background: var(--yellow-soft);
  padding: 0.45rem 0.8rem;
}

.office-sidebar {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 1rem;
  border-right: 2px solid rgba(17, 17, 17, 0.16);
  background: rgba(255, 255, 255, 0.72);
  padding: 1rem;
}

.sidebar-label {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.6;
}

@media (min-width: 1024px) {
  .office-sidebar {
    width: 13rem;
  }
}

@media (max-width: 767px) {
  .resource-meter-row {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Run lint**

Run:

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/incremental/IncrementalResourceBar.tsx src/components/incremental/IncrementalSidebar.tsx src/app/globals.css
git commit -m "feat: compact office header and nav rail"
```

## Task 4: Turn the center preview into a larger living office scene

**Files:**
- Modify: `src/components/incremental/OfficeVillagePreview.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add scene-reaction support and scene-first markup**

Update `OfficeVillagePreview`:

```tsx
export function OfficeVillagePreview({
  state,
  gainBubbles,
  sceneReaction,
}: {
  state: GameState;
  gainBubbles: GainBubble[];
  sceneReaction: "ambiance" | "chaos" | null;
}) {
  const ownedLocations = state.locations.filter((location) => location.owned);
  const activeWorkers = state.workers.filter((worker) => worker.count > 0);

  return (
    <section
      className={`office-scene ${sceneReaction === "ambiance" ? "office-scene-ambiance" : ""} ${
        sceneReaction === "chaos" ? "office-scene-chaos" : ""
      }`}
    >
      <div className="office-scene-gains">
        {gainBubbles.map((bubble) => (
          <span key={bubble.id} className="gain-pop paper-pill bg-[var(--yellow)] text-sm font-black">
            {bubble.label}
          </span>
        ))}
      </div>

      <div className="office-scene-header">
        <div>
          <p className="handwritten text-sm">Le bureau grandit</p>
          <h2 className="text-2xl font-black">Office Village</h2>
        </div>
        <span className="paper-pill">{ownedLocations.length} lieux</span>
      </div>

      <div className="office-floor">
        {ownedLocations.map((location) => (
          <article key={location.id} className="office-object">
            <span className="office-object-emoji">{location.emoji}</span>
            <strong>{location.name}</strong>
            <small>Niv. {location.level}</small>
            {location.id === "coffee-machine" && (
              <span aria-hidden="true" className="office-steam">
                ♨️
              </span>
            )}
          </article>
        ))}

        {activeWorkers.map((worker, index) => (
          <span
            key={worker.id}
            className="office-avatar office-float"
            style={{ animationDelay: `${index * 160}ms` }}
          >
            <span>{worker.emoji}</span>
            <strong>{worker.count}</strong>
          </span>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add the office-scene CSS**

Append to `src/app/globals.css`:

```css
.office-layout {
  display: grid;
  gap: 1rem;
}

.office-scene {
  position: relative;
  min-height: 28rem;
  overflow: hidden;
  border: 2px solid rgba(17, 17, 17, 0.18);
  border-radius: 1.5rem;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 239, 117, 0.4), transparent 26%),
    radial-gradient(circle at 82% 15%, rgba(219, 238, 255, 0.55), transparent 24%),
    radial-gradient(var(--grid) 1px, transparent 1px),
    var(--background);
  background-size:
    auto,
    auto,
    24px 24px,
    auto;
  padding: 1rem;
  box-shadow: 0 14px 30px rgba(17, 17, 17, 0.08);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease;
}

.office-scene-header,
.office-scene-gains {
  position: relative;
  z-index: 2;
}

.office-scene-gains {
  position: absolute;
  right: 1rem;
  top: 1rem;
  display: grid;
  justify-items: end;
  gap: 0.5rem;
}

.office-floor {
  position: relative;
  min-height: 20rem;
  margin-top: 1rem;
  border-radius: 1.25rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.7), rgba(255, 247, 191, 0.82));
}

.office-object,
.office-avatar {
  position: absolute;
  display: grid;
  gap: 0.15rem;
  border: 2px solid rgba(17, 17, 17, 0.14);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.7rem;
  box-shadow: 0 8px 18px rgba(17, 17, 17, 0.08);
}

.office-object:nth-child(1) {
  left: 5%;
  top: 12%;
}

.office-object:nth-child(2) {
  left: 38%;
  top: 8%;
}

.office-object:nth-child(3) {
  right: 7%;
  top: 18%;
}

.office-avatar {
  bottom: 12%;
  min-width: 4rem;
  justify-items: center;
}

.office-avatar:nth-of-type(1) {
  left: 12%;
}

.office-avatar:nth-of-type(2) {
  left: 34%;
}

.office-avatar:nth-of-type(3) {
  left: 56%;
}

.office-scene-ambiance {
  box-shadow:
    0 0 0 6px rgba(36, 196, 107, 0.12),
    0 14px 30px rgba(17, 17, 17, 0.08);
}

.office-scene-chaos {
  animation: chaos-nudge 650ms ease-out;
  filter: saturate(1.08);
}

@keyframes chaos-nudge {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-3px);
  }
  75% {
    transform: translateX(3px);
  }
}

@media (min-width: 1280px) {
  .office-layout {
    grid-template-columns: minmax(0, 1fr) 22rem;
  }
}
```

- [ ] **Step 3: Run lint and the focused presentation tests**

Run:

```bash
npm run lint
npm test -- tests/incrementalScenePresentation.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/incremental/OfficeVillagePreview.tsx src/app/globals.css
git commit -m "feat: enlarge living office scene"
```

## Task 5: Strengthen the mission, quick actions, incident, and compact journal

**Files:**
- Modify: `src/components/incremental/OfficeGuidanceCard.tsx`
- Modify: `src/components/incremental/ManualActionsPanel.tsx`
- Modify: `src/components/incremental/IncidentPanel.tsx`
- Modify: `src/components/GameLog.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Make quick actions read like large buttons**

Replace each manual-action card with:

```tsx
<button
  key={action.id}
  type="button"
  disabled={disabled}
  className={`quick-action-card ${disabled ? "quick-action-disabled" : ""}`}
  onClick={() => onUse(action.id)}
>
  <span className="text-2xl">{action.emoji}</span>
  <strong>{action.name}</strong>
  <span className="text-xs">{action.cost ? `Coût : ${formatResourceEffect(action.cost)}` : "Sans coût"}</span>
  <span className="text-xs">Gain : {formatResourceEffect(action.effect)}</span>
  <span className="quick-action-state">
    {remaining > 0 ? `${Math.ceil(remaining / 1000)} s` : affordable ? "Utiliser" : "Pas assez"}
  </span>
</button>
```

- [ ] **Step 2: Promote the incident card into a game event**

Update `IncidentPanel` to use:

```tsx
<section className="incident-card">
  <div className="flex items-start gap-3">
    <span className="text-3xl">🚨</span>
    <div>
      <p className="text-xs font-black uppercase tracking-wide">Incident actif</p>
      <h2 className="text-xl font-black">
        {incident.emoji} {incident.title}
      </h2>
    </div>
  </div>
  <p className="handwritten mt-3">{incident.description}</p>
  <div className="mt-4 grid gap-2">
    {incident.choices.map((choice) => (
      <button key={choice.id} type="button" className="decision-button" onClick={() => onResolve(incident.id, choice.id)}>
        <span>{choice.label}</span>
        <span className="text-xs opacity-70">
          {choice.chance ? "Effet incertain" : formatResourceEffect(choice.effect)}
        </span>
      </button>
    ))}
  </div>
</section>
```

- [ ] **Step 3: Compact the journal**

Update `GameLog`:

```tsx
const recentEntries = getRecentLogEntries(entries, 4);
const typedEntries = getTypingState(recentEntries, visibleCharacters);

return (
  <details className="journal-panel" open>
    <summary className="cursor-pointer font-black">Journal</summary>
    <div className="mt-3 space-y-2 text-sm">
      {typedEntries.map((entry, index) => (
        <p key={`${recentEntries[index]}-${index}`} className="handwritten">
          {entry.text}
          {entry.typing && <span aria-hidden className="typing-cursor">|</span>}
        </p>
      ))}
    </div>
  </details>
);
```

Use `getRecentLogEntries` from `@/lib/incrementalPresentation`.

- [ ] **Step 4: Lighten and sharpen the mission card**

Keep the same mission logic, but change the surface classes to:

```tsx
<section key={missionPulseKey} className="mission-card mission-pop">
```

and keep progress / reward blocks as separate quieter chips.

- [ ] **Step 5: Add the related CSS**

Append to `src/app/globals.css`:

```css
.mission-card,
.incident-card,
.journal-panel {
  border: 2px solid rgba(17, 17, 17, 0.16);
  border-radius: 1.25rem;
  padding: 1rem;
  box-shadow: 0 10px 24px rgba(17, 17, 17, 0.06);
}

.mission-card {
  background: linear-gradient(135deg, rgba(238, 227, 255, 0.92), rgba(255, 247, 191, 0.86));
}

.quick-action-card {
  display: grid;
  gap: 0.35rem;
  border: 2px solid rgba(17, 17, 17, 0.14);
  border-radius: 1.15rem;
  background: var(--mint);
  padding: 0.9rem;
  text-align: left;
  box-shadow: 0 10px 20px rgba(17, 17, 17, 0.08);
  transition:
    transform 140ms ease,
    box-shadow 140ms ease;
}

.quick-action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 24px rgba(17, 17, 17, 0.12);
}

.quick-action-disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.quick-action-state {
  margin-top: 0.35rem;
  border-radius: 999px;
  background: white;
  padding: 0.35rem 0.65rem;
  font-weight: 700;
  text-align: center;
}

.incident-card {
  background: linear-gradient(135deg, rgba(255, 228, 236, 0.95), rgba(255, 184, 77, 0.24));
}

.decision-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-radius: 999px;
  background: white;
  padding: 0.7rem 0.9rem;
  font-weight: 700;
  transition: transform 140ms ease;
}

.decision-button:hover {
  transform: translateX(2px);
}

.journal-panel {
  background: rgba(255, 250, 240, 0.82);
}
```

- [ ] **Step 6: Run the focused tests**

Run:

```bash
npm test -- tests/gameLog.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/incremental/OfficeGuidanceCard.tsx src/components/incremental/ManualActionsPanel.tsx src/components/incremental/IncidentPanel.tsx src/components/GameLog.tsx src/app/globals.css
git commit -m "feat: refresh core office interaction panels"
```

## Task 6: Soften cards and finalize responsive visual polish

**Files:**
- Modify: `src/components/incremental/WorkerCard.tsx`
- Modify: `src/components/incremental/LocationCard.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Switch cards to compact shop styling**

Wrap card roots with:

```tsx
className={`shop-card ${locked ? "surface-quiet" : "shop-card-worker"} ${emphasisClass}`}
```

for workers, and:

```tsx
className={`shop-card ${location.owned ? "shop-card-location" : "bg-white"} ${emphasisClass}`}
```

for locations.

Reduce long text spacing and keep the same purchase handlers and disabled logic.

- [ ] **Step 2: Add compact card CSS and responsive rules**

Append to `src/app/globals.css`:

```css
.shop-panel {
  align-self: start;
  background: rgba(255, 255, 255, 0.78);
}

.shop-tab {
  border-radius: 999px;
  background: white;
  padding: 0.55rem 0.5rem;
  font-size: 0.85rem;
  font-weight: 700;
}

.shop-tab-active {
  background: var(--yellow);
}

.shop-card {
  border: 2px solid rgba(17, 17, 17, 0.14);
  border-radius: 1.15rem;
  padding: 0.85rem;
  box-shadow: 0 8px 18px rgba(17, 17, 17, 0.06);
}

.shop-card-worker {
  background: var(--yellow-soft);
}

.shop-card-location {
  background: var(--blue);
}

.shop-card-upgrade {
  background: var(--purple);
}

@media (max-width: 1279px) {
  .shop-panel {
    order: -1;
  }
}
```

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/incremental/WorkerCard.tsx src/components/incremental/LocationCard.tsx src/app/globals.css
git commit -m "feat: compact office shop cards"
```

## Task 7: Verify the full UI story and document the iteration

**Files:**
- Modify: `progress.md`

- [ ] **Step 1: Run the full automated checks**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all commands PASS.

- [ ] **Step 2: Run the app locally**

Run:

```bash
npm run build
npm run start
```

Expected: the app serves locally and loads without errors.

- [ ] **Step 3: Verify in the browser**

Check these visible states in the in-app browser:

1. Desktop layout shows left navigation, large central office, and right-side shop.
2. Header is compact and no longer steals vertical space.
3. Shop tabs switch between `Personnages`, `Lieux`, and `Upgrades`.
4. Manual actions look like strong quick-action buttons and still respect cooldowns.
5. Incident choices look like decision buttons.
6. Journal shows only the latest few entries and can be collapsed.
7. Buying / using actions still changes the same resources as before.
8. Gain bubbles appear, coffee animation remains subtle, ambiance reaction is positive, chaos reaction is restrained.
9. Narrower viewport still stacks into a usable order.

- [ ] **Step 4: Update the progress log**

Append to `progress.md`:

```md
## 2026-05-18 game-like office layout pass
- Reworked the office screen into a left-nav / center-scene / right-shop structure.
- Compact header, larger living office scene, unified shop tabs, stronger quick actions, clearer incident styling, and compact journal feed implemented without changing game rules.
- Browser verification covered desktop layout, tab switching, quick-action cooldowns, incident decisions, compact journal, scene feedback, and responsive stacking.
```

- [ ] **Step 5: Commit**

```bash
git add progress.md
git commit -m "docs: record office layout refresh"
```

## Self-review checklist

- Spec coverage:
  - compact header → Task 3
  - left navigation / center office / right shop → Tasks 2, 3, 4
  - larger scene with objects, avatars, and mood reactions → Task 4
  - unified shop with tabs and category colors → Tasks 2 and 6
  - stronger manual actions → Task 5
  - more visible incident → Task 5
  - quieter compact journal → Tasks 1 and 5
  - responsive desktop-first layout → Tasks 3, 4, 6, 7
  - no gameplay changes → preserved by architecture and verification in Task 7
- Placeholder scan:
  - no `TODO`, `TBD`, or undefined future work remains in the plan.
- Type consistency:
  - `SceneReaction`, `getSceneReaction`, and `getRecentLogEntries` are defined before use;
  - `OfficeView` receives `sceneReaction` and `onUnlockSkill` before passing them down;
  - `OfficeShopPanel` uses existing `GameState`, `WorkerCard`, `LocationCard`, and `Skill` types.
