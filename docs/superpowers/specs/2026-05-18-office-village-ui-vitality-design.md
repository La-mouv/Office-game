# Office Village UI Vitality Design

## Goal

Turn the current Office Village screen from a readable prototype dashboard into a more game-like interface that feels lively, playful, and easier to scan, **without changing the game rules or saved data**.

The player should feel that:

- the office is the heart of the game;
- their village is visibly growing;
- the next useful click is easy to find;
- the interface keeps its handmade office-paper personality.

## Non-goals

- No change to economy, progression, incidents, missions, cooldowns, or unlock logic.
- No replacement of the current cartoon / paper art direction.
- No new gameplay system.
- No heavy illustration pipeline or 3D scene.

## Chosen Direction

Use an **equilibrated living office scene**:

- more playful than a dashboard;
- more structured than a full illustration;
- centered on a large office scene with small animated objects and avatars;
- supported by compact UI panels around it.

This keeps the interface safe to read while making the game feel much more alive.

## Information Hierarchy

### Primary

1. Current resources
2. Office Village scene
3. Available quick actions
4. Active mission or incident

### Secondary

1. Shop choices
2. Navigation between Bureau / Upgrades / Réussites
3. Journal feed

### Quiet

1. Locked content
2. Long explanations already understood after the first minute
3. Menu / meta controls

## Layout

### 1. Compact header

The header stays at the top and becomes shorter:

- game name on the left;
- compact resource pills for idées, budget, réputation, talent;
- two slimmer modern gauges for ambiance and chaos;
- low height so more room is left for the game scene.

### 2. Main desktop structure

Use a three-zone desktop layout:

```text
┌──────────────┬──────────────────────────────┬────────────────────┐
│ Navigation   │ Office Village               │ Boutique           │
│              │ grande scène centrale        │ onglets            │
│ Bureau       │ lieux + avatars + effets      │ Personnages        │
│ Upgrades     │ mission + actions rapides     │ Lieux              │
│ Réussites    │ incident + journal compact    │ Upgrades           │
└──────────────┴──────────────────────────────┴────────────────────┘
```

- Left column: simple navigation only.
- Center column: largest area of the page, focused on the office scene and moment-to-moment play.
- Right column: one unified shop with tabs `Personnages`, `Lieux`, `Upgrades`.

### 3. Responsive behavior

- Desktop first.
- On narrower screens, columns may stack in this order:
  1. header,
  2. scene,
  3. quick actions,
  4. shop,
  5. incident / journal,
  6. navigation if needed.
- Nothing important should require hover to understand.

## Component Design

### Header

- Smaller visual footprint.
- Pills remain readable but less tall.
- Gauges use softer borders and clearer fill color.
- Ambiance and chaos feel like game meters, not admin progress bars.

### Office Village scene

This becomes the visual hero.

- Built locations appear as small objects or tiles placed in the office.
- Owned workers appear as small avatars inside the scene.
- Empty build space remains visible so growth feels tangible.
- The scene uses layered paper textures and light environmental decoration, but not enough to hide information.

Suggested scene behaviors:

- floating `+ idées` gain bubble;
- gentle coffee-machine motion;
- subtle positive glow / lift when ambiance rises;
- subtle shake or warm tint when chaos rises.

### Unified shop

The right column merges people, places, and upgrades into one coherent shop.

- Tabs: `Personnages`, `Lieux`, `Upgrades`.
- Cards are shorter and easier to scan.
- Color families:
  - personnages: pale yellow;
  - lieux: pale blue;
  - upgrades: pale purple or neutral paper;
  - actions: pale green;
  - incidents: pale orange / red;
  - missions: pale violet / gold.
- Borders become thinner and shadows softer.
- Locked cards stay visible but quieter than available ones.

### Quick actions

Manual actions become large satisfying buttons:

- title;
- optional cost;
- gain;
- cooldown text when disabled;
- strong hover / press feedback.

The player should understand the whole button without reading a paragraph.

### Mission

- Keep visible near the center play area.
- Use a stronger card treatment than ordinary info panels.
- Keep reward and progress clear.

### Incident active

- Make it look like a real game event.
- Use a stronger alert color and `🚨` cue.
- Choices become obvious decision buttons.
- Preserve the humorous tone in text.

### Journal

- Make it secondary.
- Use a compact feed showing only the latest few entries.
- Prefer a small collapsible panel rather than a visually dominant large card.

## Visual Language

- Keep the existing handmade / office-paper identity.
- Reduce the feeling of “black box around every object”.
- Use more breathing room between major surfaces.
- Reserve stronger contrast for things the player can act on now.
- Add hover states and short transitions to all clickable elements.
- Prefer rounded paper edges, soft shadows, and a few sketch-like accents over thick borders everywhere.

## Motion System

### Ambient motion

- slow, low-amplitude animation only;
- office feels awake while idle;
- examples: coffee steam, worker bobbing, tiny paper float.

### Feedback motion

- resource gain bubble on action;
- button press compression;
- small reveal when a new location or worker appears;
- mission update pulse.

### State-reaction motion

- ambiance increase: soft positive shimmer / lift;
- chaos increase: brief gentle shake or warm pulse.

### Motion safety

- No important information conveyed by motion alone.
- All animations must stay short and non-blocking.
- Respect `prefers-reduced-motion`.

## Data and Logic Boundary

The refactor is presentational only.

- Existing game state shape remains unchanged.
- Existing logic functions remain the source of truth.
- New UI state may be transient only, for example:
  - current selected shop tab;
  - temporary floating gain bubbles;
  - short-lived animation classes.
- No persistent gameplay data should be introduced for visual effects.

## Accessibility and Usability

- Keep readable contrast.
- Preserve button labels and obvious disabled states.
- Do not rely only on color to explain card type or availability.
- Keep enough spacing for comfortable clicking.
- Respect reduced motion preferences.

## Testing and Verification

### Automated

- Existing gameplay tests must remain unchanged and pass.
- Add or update focused UI tests only where the layout introduces meaningful visible state:
  - shop tab switching;
  - journal compact behavior;
  - disabled cooldown labels;
  - scene rendering of owned workers / locations.

### Manual

- Verify the office remains understandable within the first minute.
- Verify all existing gameplay actions still work.
- Verify the desktop layout clearly reads as:
  - left navigation,
  - central office,
  - right shop.
- Verify hover / press feedback feels satisfying.
- Verify scene animations remain subtle, not noisy.
- Verify responsive stacking remains usable on smaller widths.

## Success Criteria

The redesign succeeds if:

1. the player’s eye lands on the office scene first;
2. the next useful action is easier to spot than before;
3. the screen feels warmer and more game-like within a few seconds;
4. the player can still access every current feature;
5. no gameplay behavior changes.
