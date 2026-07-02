# GRAVEBOX

A groovebox for the crypt. A pixel-art, gothic-electronic sequencer and music
creation app built entirely on the Web Audio API (via Tone.js).

## Stack

- Vue 3 (Composition API) + Vite
- [Tone.js](https://tonejs.github.io/) — audio engine, transport/scheduling, synths, effects
- Pinia — state management
- Dexie.js — IndexedDB persistence for projects/samples
- WaveSurfer.js — sample waveform display/editing
- Tonal.js — music theory helpers (scales, chords)

## Getting started

```bash
npm install
npm run dev
```

Click anywhere on the "awaken the machine" overlay on first load — browsers
require a user gesture before they'll unlock the AudioContext.

## Architecture

- `src/audio/` — all Tone.js-facing code. Deliberately framework-agnostic;
  Pinia stores hold plain serializable config, and this layer reads that
  config to build/update the actual audio graph. Keeping Tone's scheduling
  clock separate from Vue's reactivity is what keeps timing sample-accurate.
- `src/audio/SequencerBridge.js` — the glue layer. Watches the tracks/project
  stores and keeps a live `TrackEngine` per track in sync, rescheduling the
  active pattern's steps on the Tone transport whenever it changes.
- `src/audio/export/` — WAV export via `Tone.Offline` (wraps
  `OfflineAudioContext`). Renders the whole song non-realtime instead of
  capturing a live playthrough, so export is instant and glitch-free.
- `src/stores/` — Pinia: `project` (patterns/arrangement), `tracks` (track
  configs, effects, mixer state), `transport` (play state, BPM, swing), `ui`.
- `src/components/` — organized by domain: `sequencer/`, `tracks/`, `synth/`,
  `sampler/`, `mixer/`, `controls/` (reusable pixel-art knob/slider/button),
  `visualizers/`.

## Design system

Gothic-electronic pixel palette — see `src/styles/theme.css` for the full
token set:

| Token | Hex | Use |
|---|---|---|
| Void | `#120E18` | app background |
| Crypt | `#1E1626` | panels |
| Bone | `#E8E0D4` | primary text |
| Blood | `#B0223F` | primary accent — record, active-hot |
| Phosphor | `#4FD1C5` | secondary accent — playhead, active-cool |
| Iron | `#4A4458` | borders, grid lines |

Type: **Alagard** (pixel blackletter) for display/headers, **Silkscreen**
for UI labels. Font files aren't bundled yet — drop `.woff2` files into
`src/assets/fonts/` (referenced from `public/fonts/` at build time).

Signature motion: active steps flicker like stained-glass embers
(`.gb-ember`), and the playhead renders as a small pixel candle-flame
(`.gb-playhead`) rather than a plain highlight.

## Status

Core loop is wired end-to-end: transport play/stop, BPM/swing, a working
step sequencer with live audio via `TrackEngine`, and mute/solo per track.

Not yet built: piano roll, sample browser/import, full effects rack UI,
mixer view, pattern arrangement UI, WAV export button (encoder + offline
render pipeline exist in `src/audio/export/`, just needs a UI trigger),
project save/load via Dexie, Web MIDI input, spectrum visualizer component.
