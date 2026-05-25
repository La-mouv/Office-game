Original prompt: Build a playable local web MVP of Office Village from the provided PRD and implementation plan, prioritizing a complete game loop over extra polish.

## Progress
- Starting from an empty repository on main, user approved working directly in place.
- Priority: compile + complete playable loop before polish.

## TODO
- Future polish only: auto-layout, drag-and-drop, richer animations, and deeper balancing.

- Scaffold Next.js generated via temporary lowercase project because npm rejects uppercase package names.
- Added Vitest for core game-logic tests before implementation.
- Core game logic implemented with deterministic tests covering initial state, cards, connections, events, projects, skills, crafting, and win/loss.
- React UI, whiteboard styling, four views, autosave, manual save/load, and end-state overlays implemented.
- Added guarded save parsing so malformed localStorage data is ignored safely.
- Final browser smoke verification passed; screenshots reviewed for start, play loop, win, and loss states.

## 2026-05-17 incremental missions
- Added a mission system with a short guided opening sequence, dynamic follow-up missions, rewards, and short-lived production boosts.
- Extended incremental saves so older saves without mission fields still reload safely with defaults.
- Replaced the old static guidance card with a visible “Mission du moment” card plus active boost badges.
- Browser verification caught and fixed two UX edges: stale old-save missions now advance immediately on reload, and mission progress is rounded for humans instead of showing raw decimals.
- Full test suite, lint, build, and browser verification now pass for the mission flow.
- Browser smoke verification run after UI build.
- Added local Playwright dependency for browser-level verification of the playable loop.
- Final browser smoke verification passed; screenshots reviewed for start, play loop, win, and loss states.

## 2026-05-18 UI vitality implementation
- User approved the cozy-diorama direction with both ambient life and satisfying click feedback.
- Starting implementation pass for hierarchy, scene motion, and transient visual feedback.
- Added a presentation helper layer for strong/quiet card emphasis and readable gain labels.
- Promoted the office preview into the hero surface with ambient motion hooks, floating gain bubbles, and richer active-state contrast.
- Added stronger differentiation for available, locked, and disabled UI surfaces so the screen no longer speaks in one uniform visual voice.
- Browser verification covered the opening screen, manual-action gain feedback, first worker purchase, mission transition, reduced-motion fallback, and a later state with the coffee machine built.
- Gotcha: after rebuilding the production bundle, `next start` needed a restart before browser verification; otherwise the already-running server served a stale bundle and showed a load error page.
- Moved overview, golden-rule copy, save/load, and new-game controls into a bottom-left popup menu so the sidebar stays lighter during play.
- Merged the old synergies page and milestone cards into a single `Réussites` section with a `Mur des réussites`.
- Unlocked combo/palier badges now also appear inside the office scene, so long-term progress decorates the bureau itself.
- Added a restrained typewriter effect for the newest journal entry only, with older entries staying instantly readable and reduced-motion users seeing the full line immediately.

## 2026-05-18 game-like office layout pass
- Reworked the office screen into a left-nav / center-scene / right-shop structure.
- Compact header, larger living office scene, unified shop tabs, stronger quick actions, clearer incident styling, and compact journal feed implemented without changing game rules.
- Browser verification covered desktop layout, shop tab switching, quick-action cooldowns, incident decisions, compact journal, scene feedback, and responsive stacking.

## 2026-05-19 to-do wording pass
- Renamed the visible office-scene mission entry point from “Missions” to “To-do” while keeping the underlying mission system untouched.

## 2026-05-19 compact to-do panel
- Moved the To-do out of the office scene and into a compact secondary panel beside the Journal.
- Kept completed missions crossed out and preserved the current mission/progress display without changing game logic.

## 2026-05-19 action cleanup
- Removed the Sprint équipe manual action from the incremental action list.
- Moved manual actions out of the office-floor dock and into the former achievement-wall area.
- Kept achievements accessible through the top Réussites popup instead of showing the unfinished wall in the scene.

## 2026-05-19 retired sprint migration
- Added a save migration so older local saves drop retired Sprint équipe action counters and old journal entries.

## 2026-05-19 action header cleanup
- Removed the scene action-wall heading and helper sentence, leaving only the action buttons visible.

## 2026-05-19 scene resource header move
- Moved the game title chip, resource pill row, and Ambiance/Chaos meter row into the central office scene.
- Removed the separate top resource header while keeping the top controls inside the moved resource row.
- Adjusted the moved scene resource header so the title chip stays anchored on the left and resource pills/top controls align to the right on desktop.

## 2026-05-19 owned cards move to office
- Reused WorkerCard and LocationCard inside the office scene for owned recruitment and built layouts.
- Bought workers and locations are filtered out of the Development shop and become manageable from the office board.
- Worker office cards show a stack count badge plus + buy and Améliorer buttons; owned layouts keep their improve control.

## 2026-05-19 incident and max-card cleanup
- Moved the Incident button into the resource meter row between Ambiance and Chaos.
- Removed stacking from office layout cards while preserving worker stack badges.
- Replaced max-level labels with Max and removed useless max buttons from maxed cards.

## 2026-05-21 office card sizing pass
- Forced every owned card on the office board to share the same fixed height.
- Kept the equal-size rule scoped to bureau cards only, so Development shop cards can keep their normal content-driven height.
- Compacted bureau cards further by removing narrative labels from stat lines, leaving inline values like "+30 % idées · +15 % réputation".
- Simplified Development cards into purchase cards: image, title, description, and one buy button with price; removed level, production/effect lines, and upgrade buttons from that panel.
- Restored the useful reputation threshold on locked Development cards with a compact "Débloqué à X réputation" line.

## 2026-05-21 wording consistency pass
- Replaced visible incremental-game "synergie" wording with "combo" in missions, guidance, achievements, menu overview, and dormant combo views.
- Replaced the remaining visible "upgrade" guidance wording with "boost"/"talent" vocabulary.
- Removed "production globale" from talent and milestone copy, using "efficacité globale" or "bonus global" instead.
- Added a copy-consistency regression test for the active incremental text surfaces and talent price pluralization.
- Added a save migration so existing local saves refresh old mission/log wording like "Débloque Organisation" and "Synergie découverte".

## 2026-05-21 office cleanup pass
- Removed the "Le bureau grandit" micro-heading from the office scene because it did not add useful information.
- Removed raw mission progress counters like "0 / 1" from the To-do panel.
- Made the office worker buy and level-up buttons share equal width so the bottom row reads cleaner.

## 2026-05-25 menu overlay fix
- Menu and achievements dialogs now render through a body-level portal so they sit above the full game layout instead of being clipped by the animated office scene.
- Added a scrollable menu sheet height limit so lower actions remain reachable on shorter screens.
- Local verification at 1280x789 confirmed the overlay is attached to `body`, covers the full viewport, dims the Development column, and the restart confirmation buttons remain reachable after scrolling.

## 2026-05-25 loss condition
- Added a real loss state for the incremental game: ambiance at 0% or chaos at 100% now ends the run.
- The timer stops on loss, autosubmission stays win-only, old saves still rehydrate, and the player sees a restart-only loss overlay.

## 2026-05-25 welcome leaderboard cleanup
- Removed the empty-score helper sentence and the pseudo/time meta sentence from the welcome leaderboard.
- Kept the loading line only while leaderboard data is actively loading.
