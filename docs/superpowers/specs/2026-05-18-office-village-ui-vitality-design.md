# Office Village UI Vitality Design

## Goal

Make the game feel easier to read and much more alive **without removing much content**.  
The current issue is not mainly the number of elements on screen; it is that too many elements have the same visual weight and the interface feels static.

## Current Problem

- Most cards use the same shape, border weight, spacing, and visual rhythm.
- Important information and secondary information compete equally for attention.
- The office preview is present, but it does not yet feel like the emotional center of the game.
- Player actions work mechanically, but they give little visual reward after a click.
- The game state changes, yet the screen often appears still.

## Experience Target

The revised interface should feel like a **cozy diorama with living paper UI**:

- the office is the main scene;
- important information is obvious at a glance;
- secondary information remains available but quieter;
- the world is gently animated even when the player does nothing;
- clicks, unlocks, and mission completions feel satisfying immediately.

## Chosen Direction

Use **Cozy Diorama** as the base direction, with touches of **Paper vivant**:

- keep the handmade paper identity already present in the game;
- promote the office preview into the strongest visual area;
- use stronger contrast between “important now” and “background information”;
- prefer soft, frequent motion over loud, rare spectacle.

## Visual Hierarchy

### Strong emphasis

- Current mission
- Office village preview
- Purchases or upgrades currently available

### Medium emphasis

- Main resources
- Manual actions
- Active incidents

### Quiet emphasis

- Locked future content
- Journal
- Overview stats
- Repeated explanatory text

## Layout Principles

The screen should keep its existing richness, but distribute attention more deliberately:

1. **Top area:** compact resources and current mission.
2. **Center:** office village as the main visual scene.
3. **Side zones:** available recruitment and building choices.
4. **Lower area:** manual actions and secondary information.

The goal is not to hide everything. The goal is that the player naturally sees:

1. what matters now;
2. what changed;
3. what they can do next.

## Motion System

### Ambient motion

Small loops that make the office feel inhabited:

- coffee steam;
- tiny worker bobbing or idle movement;
- gentle office breathing effects;
- subtle resource shimmer when values rise.

These motions must stay calm and not distract from decision-making.

### Interaction feedback

Every important player action should answer back visually:

- resource gains rise briefly near the source;
- successful purchases pop or settle into place;
- buttons compress and rebound clearly;
- newly available content enters with a small reveal.

### Celebration moments

Important milestones should feel distinct:

- mission completion gets a short “stamp” or confirmation motion;
- new location unlocks receive a small reveal;
- synergies and major upgrades get a stronger highlight than ordinary purchases.

### Motion limits

- Avoid constant large movement.
- Avoid casino-style flashing.
- Prefer short durations and soft easing.
- Respect reduced-motion preferences when possible.

## Component-Level Changes

### Office village preview

- Becomes the visual hero of the page.
- Shows locations and active workers with more scene-like presentation.
- Receives the richest ambient animation.

### Cards

- Not all cards should look equally loud.
- Available actions should read more strongly than locked future options.
- Locked cards should be visually quieter rather than nearly as prominent as active ones.

### Mission card

- Remains highly visible.
- Gets stronger completion feedback and may visually “resolve” before the next mission appears.

### Manual actions

- Keep their presence, but give stronger hover/click response and clearer cooldown feedback.

### Journal and overview

- Stay available, but use calmer treatment so they stop competing with the core loop.

## Technical Shape

- No gameplay-rule changes are required.
- Existing React component boundaries can stay mostly intact.
- Most work should live in presentational components plus shared CSS/animation utilities.
- The office preview may need richer internal markup so individual locations and workers can animate separately.
- Motion state should be driven from existing game events where possible rather than introducing new persistent game data.

## Error Handling and Safety

- Animation must never block a game action from completing.
- If a motion class fails or a browser skips an animation, the game should still remain fully usable.
- Existing save/load behavior should remain unchanged.

## Accessibility and Performance

- Preserve readable contrast.
- Do not rely on motion alone to communicate success.
- Add or respect `prefers-reduced-motion` so players can reduce animation.
- Prefer CSS transforms and opacity changes over layout-thrashing effects.

## Testing and Verification

### Automated

- Keep existing game-logic tests unchanged and passing.
- Add focused UI tests only where visual state changes produce meaningful class/state differences.

### Manual

- Verify the player can still understand the main loop in the first minute.
- Verify the office feels alive even while idle.
- Verify purchases, mission completion, and unlocks create visible feedback.
- Verify secondary information is still available but no longer dominates the screen.
- Verify reduced-motion mode remains usable.

## Non-Goals

- No major gameplay redesign.
- No removal of large feature groups purely for minimalism.
- No full art-style replacement.
- No heavy 3D or asset pipeline shift.

## Success Criteria

The change is successful if:

- the player’s eye lands first on mission, office, and available actions;
- the interface feels more alive within the first few seconds;
- important clicks feel better immediately;
- the game remains readable, cozy, and not visually exhausting.
