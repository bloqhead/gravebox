// audio/registry.js
// Single source of truth for live TrackEngine instances. SequencerBridge
// owns creation/disposal; anything else (piano keyboard, mixer meters)
// just reads from here so there's only ever one audio graph per track.

const engines = new Map()

export function setEngine(id, engine) {
  engines.set(id, engine)
}

export function getEngine(id) {
  return engines.get(id)
}

export function deleteEngine(id) {
  const engine = engines.get(id)
  if (engine) engine.dispose()
  engines.delete(id)
}

export function hasEngine(id) {
  return engines.has(id)
}

export function allIds() {
  return [...engines.keys()]
}
