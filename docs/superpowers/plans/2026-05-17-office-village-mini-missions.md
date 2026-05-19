# Office Village Mini-Missions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a cozy one-at-a-time mini-mission loop that teaches the opening, then keeps the idle game lively with gentle short-term goals and visible temporary boosts.

**Architecture:** Keep missions in the incremental domain layer beside workers, locations, and milestones. Store one active mission plus completed mission IDs and active boosts in `GameState`; mission progression remains pure and deterministic enough for Vitest coverage. The Bureau UI replaces the old guidance card with the active mission card and a compact boost strip.

**Tech Stack:** Next.js 16, React 19 client components, TypeScript, Vitest, localStorage.

---

### Task 1: Mission Domain

**Files:**
- Modify: `src/types/incremental.ts`
- Modify: `src/lib/incrementalData.ts`
- Create: `src/lib/incrementalMissions.ts`
- Test: `tests/incrementalMissions.test.ts`

- [ ] Add failing tests for guided mission order, dynamic mission selection, no immediate repeat, and mission rewards.
- [ ] Add mission/boost types plus guided mission data and dynamic mission templates.
- [ ] Implement pure selection, completion, and reward helpers until mission tests pass.

### Task 2: Engine Integration

**Files:**
- Modify: `src/lib/incrementalGame.ts`
- Test: `tests/incrementalGame.test.ts`

- [ ] Add failing tests proving boosts affect production and expire on time.
- [ ] Track manual action use counts, advance missions after relevant state changes, and fold active boosts into production multipliers.
- [ ] Expire boosts during ticks and keep mission progression safe when several guided goals are already satisfied.

### Task 3: Persistence

**Files:**
- Modify: `src/lib/incrementalStorage.ts`
- Test: `tests/incrementalStorage.test.ts`

- [ ] Add failing tests for old saves without mission fields and new saves with mission/boost state.
- [ ] Rehydrate missing mission fields with defaults while preserving valid active mission, completed missions, and active boosts.

### Task 4: Bureau UX

**Files:**
- Replace: `src/components/incremental/OfficeGuidanceCard.tsx`
- Modify: `src/components/incremental/OfficeView.tsx`
- Modify: `src/components/incremental/IncrementalGameShell.tsx`

- [ ] Replace the guidance card with a mission card showing title, description, progress, and reward.
- [ ] Add a compact active-boost display with remaining time.
- [ ] Keep only one mission visible and preserve the current uncluttered Bureau layout.

### Task 5: Verification

- [ ] Run `npm test`, `npm run lint`, and `npm run build`.
- [ ] Play the first minutes locally and confirm missions advance, rewards land, boosts appear, and the game still feels idle rather than hectic.
