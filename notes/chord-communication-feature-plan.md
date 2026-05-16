# Chord Communication Feature Plan

## Context

This app is currently a collection of prototype features around realtime multiplayer, MIDI, music interaction, dashboards, and chord display. The product goal is to help musicians communicate chords while playing together.

The app should support two primary personas:

1. **The Maestro** — a power user with a MIDI keyboard or controller, making tonal decisions and leading structure/variation.
2. **The Jammer** — a participant who mostly needs to know what chord to play right now.

## Code Areas Researched

Primary relevant files:

- `src/features/src/modules/dashboards/keytar_and_foot_dashboard/*`
- `src/features/src/modules/dashboards/keytar_and_foot_dashboard/single_octave_root_mode_supervisor.tsx`
- `src/features/src/modules/dashboards/keytar_and_foot_dashboard/chord_player.ts`
- `src/features/src/modules/song_structures_dashboards/song_structures_dashboards_module.tsx`
- `src/features/src/modules/song_structures/components/chord_display.tsx`
- `src/features/src/modules/song_structures/components/guitar_tab_view.tsx`
- `src/features/src/snacks/root_mode_snack/*`
- `src/features/src/modules/phone_jam/phone_jam_module.tsx`
- Springboard state-management docs and APIs

Existing useful concepts:

- `createSharedState` — realtime, ephemeral, cross-device state.
- `createPersistentState` — database-backed state that survives restarts.
- `createUserAgentState` — local-only UI/device preferences.
- Current chord concepts are split across:
  - simple `{ root, quality }` chord choices
  - generated `ChordWithName`
  - debug MIDI state
  - draft/confirmed chord arrays

## Product Direction

The app should become a realtime chord communication surface.

### Maestro

The Maestro needs to:

- Declare current chord from MIDI input.
- Change key/scale.
- Build, save, and revisit progressions.
- Optionally send MIDI output elsewhere.
- See current musical state and MIDI/debug status.
- Control what Jammers see.

### Jammer

The Jammer needs to:

- Know the current chord immediately.
- Optionally see the next chord or progression position.
- Use the app on phones in portrait and landscape.
- Use the app on large TV/kiosk screens with giant readable chords.
- Avoid unnecessary controls and configuration.

## Proposed Data Model

Separate domain state from UI props and MIDI transport.

```ts
type PitchClass =
  | 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb'
  | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#'
  | 'Ab' | 'A' | 'A#' | 'Bb' | 'B';

type ChordQuality =
  | 'major'
  | 'minor'
  | 'dominant7'
  | 'major7'
  | 'minor7'
  | 'diminished'
  | 'sus2'
  | 'sus4'
  | 'power'
  | 'unknown';

type ChordSymbol = {
  root: PitchClass;
  quality: ChordQuality;
  bass?: PitchClass;
  extensions?: string[];
  display: string;
};

type SessionKey = {
  tonic: PitchClass;
  mode: 'major' | 'minor' | 'dorian' | 'mixolydian' | 'unknown';
};

type ChordEvent = {
  id: string;
  chord: ChordSymbol;
  declaredAt: number;
  declaredByUserId?: string;
  source: 'midi' | 'manual' | 'progression' | 'imported';
  midiInput?: {
    notes: number[];
    velocity?: number;
    channel?: number;
  };
};

type Progression = {
  id: string;
  name: string;
  chords: ChordSymbol[];
  createdAt: number;
  updatedAt: number;
  lastUsedAt?: number;
  tags?: string[];
};

type JamSessionState = {
  sessionId: string;
  key: SessionKey;
  currentChord: ChordEvent | null;
  previousChords: ChordEvent[];
  activeProgressionId: string | null;
  progressionCursor: number | null;
  savedProgressions: Progression[];
};
```

## Springboard State Mapping

Recommended state storage:

- `createSharedState<JamSessionState>` for live session state.
- `createPersistentState<Progression[]>` for reusable progressions.
- `createUserAgentState<ViewPrefs>` for per-device layout, theme, and debug preferences.
- Optional future `createSharedState<PresenceState>` for connected devices/personas.

## Proposed View Props

### Jammer Chord Display

```ts
type JammerChordDisplayProps = {
  currentChord: ChordSymbol | null;
  nextChord?: ChordSymbol | null;
  keySignature?: SessionKey;
  mode: 'phonePortrait' | 'phoneLandscape' | 'tv';
  isStale?: boolean;
};
```

### Maestro Dashboard

```ts
type MaestroDashboardProps = {
  session: JamSessionState;
  midiStatus: {
    inputConnected: boolean;
    outputConnected: boolean;
    lastInputNotes: number[];
  };
  onSetKey: (key: SessionKey) => void;
  onDeclareChord: (chord: ChordSymbol) => void;
  onSelectProgression: (id: string) => void;
  onSaveProgression: (progression: Progression) => void;
  onAdvanceProgression: () => void;
  onGoBackProgression: () => void;
};
```

## Storybook Scenarios

Storybook should become the design lab for personas and data scenarios.

Recommended stories:

- No chord yet.
- Current chord only.
- Current plus next chord.
- Rapid chord changes.
- Long chord names.
- Phone portrait.
- Phone landscape.
- TV/kiosk display.
- Maestro with MIDI connected.
- Maestro without MIDI connected.
- Saved progression recall.
- Draft progression editing.

## Implementation Plan

### Phase 1 — Model and Pure Components

Goal: create a mergeable foundation without risky Springboard or MIDI rewrites.

Tasks:

1. Add domain model files, likely:
   - `src/features/src/modules/chord_session/chord_session_types.ts`
   - `src/features/src/modules/chord_session/chord_session_fixtures.ts`
2. Add props-only components:
   - `JammerChordDisplay`
   - `MaestroDashboard`
   - `ProgressionStrip`
   - `ChordCard`
3. Keep components pure and Storybook-friendly.
4. Add fixture scenarios for personas and layouts.

### Phase 2 — Storybook

Goal: establish a reliable visual scenario environment.

Target structure:

- `.storybook/*`
- `src/**/*.stories.tsx`
- fixture-driven stories

Storybook should cover:

- Jammer phone views.
- Jammer TV/kiosk view.
- Maestro control surface.
- Progression recall.
- Empty/error/awkward states.

### Phase 3 — Springboard Module Integration

Goal: wire the new model into the app while preserving prototypes.

Add a new module rather than rewriting old dashboards immediately:

```ts
springboard.registerModule('chord_session', {}, async (moduleAPI) => {
  const liveSession = await moduleAPI.statesAPI.createSharedState<JamSessionState>(...);
  const savedProgressions = await moduleAPI.statesAPI.createPersistentState<Progression[]>(...);
  const viewPrefs = await moduleAPI.statesAPI.createUserAgentState(...);

  // routes:
  // /maestro
  // /jammer
  // /kiosk
});
```

This lets the old prototype routes continue to work while the real product surface is built beside them.

### Phase 4 — MIDI Adapter

Goal: extract MIDI behavior into testable adapters feeding the domain model.

Relevant source prototypes:

- `single_octave_root_mode_supervisor.tsx`
- `chord_player.ts`
- `root_mode_snack`

Extract testable functions:

- MIDI notes to chord symbol.
- Key plus note to scale-degree chord.
- Chord symbol to MIDI notes.
- MIDI buttons to progression commands.

### Phase 5 — Verification and Merge Readiness

Before merge:

- Install dependencies if needed.
- Run type checks.
- Run app build.
- Verify Storybook starts successfully.
- Verify stories render without runtime errors.
- Verify existing prototype routes still work.

## Recommendation

Start with **Phase 1 plus Storybook fixtures**.

Avoid wiring MIDI first. The current risk is allowing prototype MIDI state shapes to leak into the product model. If the session model and props stabilize first, the Maestro/Jammer views can be designed around real use cases, and MIDI can become an adapter into that model.

## Current Tooling Notes

- `serena` CLI currently fails with: `bad interpreter: Permission denied`.
- `bd` currently reports no beads database found in this worktree.
- A subagent was started to independently investigate Storybook setup and create a starter Storybook shell/story template.
