// audio/export/offlineRender.js
// Renders the full song non-realtime via Tone.Offline, which wraps
// OfflineAudioContext. This is what makes export instant and glitch-free
// instead of capturing a live playthrough.

import * as Tone from 'tone'
import { TrackEngine } from '../TrackEngine.js'
import { audioBufferToWav } from './wavEncoder.js'

/**
 * @param {object} project - full project state (tracks, patterns, arrangement, bpm)
 * @param {number} durationSeconds - total render length
 * @returns {Promise<Blob>} WAV file blob
 */
export async function renderProjectToWav(project, durationSeconds) {
  const buffer = await Tone.Offline(({ transport }) => {
    transport.bpm.value = project.bpm
    transport.swing = project.swing ?? 0

    const engines = project.tracks.map((trackConfig) => {
      const engine = new TrackEngine(trackConfig)
      return { config: trackConfig, engine }
    })

    // Schedule every step of every pattern in the arrangement against
    // the offline transport, exactly as the live engine would.
    project.arrangement.forEach((patternRef, barIndex) => {
      const pattern = project.patterns[patternRef.patternId]
      engines.forEach(({ config, engine }) => {
        const steps = pattern.tracks[config.id]?.steps ?? []
        steps.forEach((step, stepIndex) => {
          if (!step.active) return
          const time = `${barIndex}:0:${stepIndex}`
          transport.scheduleOnce((t) => {
            engine.trigger(step.note ?? 'C4', step.duration ?? '16n', t, step.velocity ?? 1)
          }, time)
        })
      })
    })

    transport.start()
  }, durationSeconds)

  return audioBufferToWav(buffer.get())
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
