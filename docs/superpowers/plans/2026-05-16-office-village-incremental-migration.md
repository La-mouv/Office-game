# Office Village Incremental Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the visible deckbuilder experience with a playable cozy incremental office builder while preserving the existing Office Village visual identity.

**Architecture:** Keep the legacy deckbuilder modules intact for safety, but introduce a new incremental domain model, rules engine, persistence layer, and UI shell beside them. Switch the app entrypoint to the new shell so the player only sees Bureau / Upgrades / Synergies. The rules stay pure and deterministic where possible so the new idle loop is easy to test.

**Tech Stack:** Next.js 16 App Router, React 19 client components, TypeScript, Vitest, localStorage.

---

## File map

- Create `src/types/incremental.ts` for the new state and domain types.
- Create `src/lib/incrementalData.ts` for workers, locations, synergies, incidents, skills, milestones, and manual actions.
- Create `src/lib/incrementalGame.ts` for pure rules and progression functions.
- Create `src/lib/incrementalStorage.ts` for the new save key and safe parsing.
- Create `src/components/incremental/*` for the new 3-view UI.
- Modify `src/app/page.tsx` so the visible app uses the incremental shell.
- Modify `README.md` so it describes the new playable loop.
- Add `tests/incrementalGame.test.ts` and `tests/incrementalStorage.test.ts`.

## Task 1: Lock the new rules with tests

- [ ] Add failing tests for initial state, production, worker/location costs, unlock gates, synergies, incidents, manual actions, skills, milestones, completion, and persistence.
- [ ] Run `npm test -- --runInBand` and verify the new tests fail because the incremental modules do not exist yet.

## Task 2: Build the incremental domain layer

- [ ] Add the new types and content data from the PRD.
- [ ] Implement pure rules for clamping, production, purchases, upgrades, tick progression, incidents, skills, milestones, completion, and reset.
- [ ] Re-run the incremental tests until they pass.

## Task 3: Add safe persistence

- [ ] Implement `office-village-incremental-save-v1` parsing, save, load, and reset helpers.
- [ ] Verify malformed saves are ignored instead of crashing the app.

## Task 4: Replace the visible experience

- [ ] Build the new resource bar, sidebar, office view, worker/location cards, manual actions, incident panel, upgrades view, synergies view, and completion overlay.
- [ ] Add the 1-second tick loop, 5-second autosave, browser-only load behavior, and save/load/new-game buttons in a client shell.
- [ ] Point `src/app/page.tsx` at the new shell so deck/hand/craft/projects no longer appear in the main experience.

## Task 5: Verify the whole story

- [ ] Run `npm test`, `npm run lint`, and `npm run build`.
- [ ] Run the app locally and confirm resources rise automatically, purchases work, incidents resolve, unlocks appear, and the three-view layout matches the PRD.
- [ ] Update `README.md` to describe the new loop and checks.
