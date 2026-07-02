// audio/SequencerBridge.js
// The glue layer: watches the tracks/project stores, keeps a live
// TrackEngine per track, and (re)schedules the active pattern's steps
// on the Tone transport. Instantiate once at app startup.

import { watch } from 'vue'
import * as Tone from 'tone'
import { TrackEngine } from './TrackEngine.js'
import * as engine from './engine.js'
import * as registry from './registry.js'

export class SequencerBridge {
  constructor(tracksStore, projectStore, transportStore) {
    this.tracksStore = tracksStore
    this.projectStore = projectStore
    this.transportStore = transportStore
    this.scheduleId = null

    this._syncEngines()
    this._reschedule()

    // Rebuild engines when tracks are added/removed/reconfigured
    watch(
      () => tracksStore.tracks.map((t) => t.id),
      () => this._syncEngines(),
      { deep: true }
    )

    // Reschedule when the active pattern's steps change
    watch(
      () => projectStore.activePattern,
      () => this._reschedule(),
      { deep: true }
    )

    watch(
      () => transportStore.bpm,
      (bpm) => engine.setBpm(bpm)
    )

    watch(
      () => transportStore.swing,
      (swing) => engine.setSwing(swing)
    )

    // Push live synth param edits (from knobs) straight to the running
    // instrument, independent of the sequencer reschedule cycle.
    watch(
      () => tracksStore.tracks.map((t) => (t.synth ? { ...t.synth } : null)),
      () => {
        for (const config of tracksStore.tracks) {
          if (config.type !== 'synth') continue
          const trackEngine = registry.getEngine(config.id)
          if (!trackEngine) continue
          for (const [key, value] of Object.entries(config.synth)) {
            trackEngine.updateSynthParam(key, value)
          }
        }
      },
      { deep: true }
    )
  }

  _syncEngines() {
    const currentIds = new Set(this.tracksStore.tracks.map((t) => t.id))

    // Dispose engines for removed tracks
    for (const id of registry.allIds()) {
      if (!currentIds.has(id)) registry.deleteEngine(id)
    }

    // Create engines for new tracks, update params on existing ones
    for (const config of this.tracksStore.tracks) {
      if (!registry.hasEngine(config.id)) {
        registry.setEngine(config.id, new TrackEngine(config))
      }
      const trackEngine = registry.getEngine(config.id)
      trackEngine.setVolume(config.volume)
      trackEngine.setPan(config.pan)
      trackEngine.setMute(this._isEffectivelyMuted(config))
    }
  }

  _isEffectivelyMuted(config) {
    const anySolo = this.tracksStore.tracks.some((t) => t.solo)
    if (anySolo) return !config.solo
    return config.mute
  }

  _reschedule() {
    if (this.scheduleId !== null) {
      engine.clearSchedule(this.scheduleId)
      this.scheduleId = null
    }

    const pattern = this.projectStore.activePattern
    if (!pattern) return

    let stepCounter = 0
    this.scheduleId = engine.scheduleRepeat((time) => {
      const stepIndex = stepCounter % pattern.length

      for (const [trackId, trackData] of Object.entries(pattern.tracks)) {
        const step = trackData.steps[stepIndex]
        if (!step?.active) continue
        const trackEngine = registry.getEngine(trackId)
        trackEngine?.trigger(step.note, step.duration, time, step.velocity)
      }

      Tone.Draw.schedule(() => {
        this.transportStore.setStep(stepIndex, 0)
      }, time)

      stepCounter++
    }, '16n')
  }

  dispose() {
    if (this.scheduleId !== null) engine.clearSchedule(this.scheduleId)
    for (const id of registry.allIds()) registry.deleteEngine(id)
  }
}
