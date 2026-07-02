// audio/SequencerBridge.js
// The glue layer: watches the tracks/project stores, keeps a live
// TrackEngine per track, and (re)schedules the active pattern's steps
// on the Tone transport. Instantiate once at app startup.

import { watch } from 'vue'
import * as Tone from 'tone'
import { TrackEngine } from './TrackEngine.js'
import * as engine from './engine.js'

export class SequencerBridge {
  constructor(tracksStore, projectStore, transportStore) {
    this.tracksStore = tracksStore
    this.projectStore = projectStore
    this.transportStore = transportStore
    this.engines = new Map() // trackId -> TrackEngine
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
  }

  _syncEngines() {
    const currentIds = new Set(this.tracksStore.tracks.map((t) => t.id))

    // Dispose engines for removed tracks
    for (const [id, trackEngine] of this.engines) {
      if (!currentIds.has(id)) {
        trackEngine.dispose()
        this.engines.delete(id)
      }
    }

    // Create engines for new tracks, update params on existing ones
    for (const config of this.tracksStore.tracks) {
      if (!this.engines.has(config.id)) {
        this.engines.set(config.id, new TrackEngine(config))
      }
      const trackEngine = this.engines.get(config.id)
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
        const trackEngine = this.engines.get(trackId)
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
    for (const trackEngine of this.engines.values()) trackEngine.dispose()
    this.engines.clear()
  }
}
