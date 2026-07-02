// audio/TrackEngine.js
// Wraps a single track's instrument + effects chain + channel strip.
// One class handles both synth and sampler tracks so mixer/effects UI
// never has to branch on track type.

import * as Tone from 'tone'
import { getMasterBus } from './engine.js'
import { EFFECT_TYPES } from './effects/index.js'

export class TrackEngine {
  /**
   * @param {object} config - serializable track config from the Pinia store
   *   { id, type: 'synth'|'sampler', synth: {...}, sampleUrl, effects: [{type, params}], volume, pan, mute, solo }
   */
  constructor(config) {
    this.id = config.id
    this.type = config.type
    this.effectNodes = []

    this.channel = new Tone.Channel({
      volume: config.volume ?? 0,
      pan: config.pan ?? 0,
      mute: config.mute ?? false,
    })

    this.instrument = this._buildInstrument(config)
    this._buildEffectsChain(config.effects ?? [])
    this._connectChain()
  }

  _buildInstrument(config) {
    if (config.type === 'sampler') {
      return new Tone.Sampler({
        urls: config.sampleUrl ? { C4: config.sampleUrl } : {},
        onload: () => {},
      })
    }

    // Synth track: oscillator + ADSR + filter driven by config.synth
    const s = config.synth ?? {}
    return new Tone.MonoSynth({
      oscillator: { type: s.oscType ?? 'sawtooth' },
      envelope: {
        attack: s.attack ?? 0.01,
        decay: s.decay ?? 0.2,
        sustain: s.sustain ?? 0.5,
        release: s.release ?? 0.4,
      },
      filter: {
        type: s.filterType ?? 'lowpass',
        Q: s.filterQ ?? 1,
      },
      filterEnvelope: {
        attack: s.filterAttack ?? 0.02,
        decay: s.filterDecay ?? 0.2,
        sustain: s.filterSustain ?? 0.3,
        release: s.filterRelease ?? 0.5,
        baseFrequency: s.filterFreq ?? 4000,
        octaves: s.filterOctaves ?? 3,
      },
    })
  }

  _buildEffectsChain(effectsConfig) {
    this.effectNodes = effectsConfig.map((fx) => {
      const def = EFFECT_TYPES[fx.type]
      if (!def) return null
      return { type: fx.type, node: def.factory(fx.params ?? def.defaults) }
    }).filter(Boolean)
  }

  _connectChain() {
    const chain = [this.instrument, ...this.effectNodes.map((e) => e.node), this.channel]
    for (let i = 0; i < chain.length - 1; i++) {
      chain[i].connect(chain[i + 1])
    }
    this.channel.connect(getMasterBus())
  }

  /** Trigger a note (synth) or sample playback at a given transport time. */
  trigger(note, duration, time, velocity = 1) {
    if (this.type === 'sampler') {
      this.instrument.triggerAttackRelease(note ?? 'C4', duration, time, velocity)
    } else {
      this.instrument.triggerAttackRelease(note, duration, time, velocity)
    }
  }

  /** Note-on with no fixed duration — used for live keyboard/MIDI playing. */
  triggerAttack(note, time, velocity = 1) {
    this.instrument.triggerAttack(note ?? 'C4', time, velocity)
  }

  /** Note-off counterpart to triggerAttack. MonoSynth ignores `note`. */
  triggerRelease(note, time) {
    if (this.type === 'sampler') {
      this.instrument.triggerRelease(note ?? 'C4', time)
    } else {
      this.instrument.triggerRelease(time)
    }
  }

  setVolume(db) {
    this.channel.volume.rampTo(db, 0.05)
  }

  setPan(pan) {
    this.channel.pan.rampTo(pan, 0.05)
  }

  setMute(muted) {
    this.channel.mute = muted
  }

  updateSynthParam(key, value) {
    if (this.type !== 'synth') return
    // Map flat config keys to Tone's nested param paths
    const map = {
      attack: 'envelope.attack',
      decay: 'envelope.decay',
      sustain: 'envelope.sustain',
      release: 'envelope.release',
      oscType: 'oscillator.type',
      filterType: 'filter.type',
      filterQ: 'filter.Q',
      filterFreq: 'filterEnvelope.baseFrequency',
      filterAttack: 'filterEnvelope.attack',
      filterDecay: 'filterEnvelope.decay',
      filterSustain: 'filterEnvelope.sustain',
      filterRelease: 'filterEnvelope.release',
      filterOctaves: 'filterEnvelope.octaves',
    }
    const path = map[key]
    if (!path) return
    const [group, prop] = path.split('.')
    // Some of these are AudioParams (settable via .value), others are
    // plain properties depending on Tone's internal wiring — try both.
    const target = this.instrument[group]
    if (target[prop] && typeof target[prop] === 'object' && 'value' in target[prop]) {
      target[prop].value = value
    } else {
      target[prop] = value
    }
  }

  dispose() {
    this.instrument.dispose()
    this.effectNodes.forEach((e) => e.node.dispose())
    this.channel.dispose()
  }
}
