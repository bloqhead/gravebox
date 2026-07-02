import { defineStore } from 'pinia'
import { nanoid } from '../utils/id.js'

/** @typedef {'synth'|'sampler'} TrackType */

function defaultSynthParams() {
  return {
    oscType: 'sawtooth',
    attack: 0.01,
    decay: 0.2,
    sustain: 0.5,
    release: 0.4,
    filterType: 'lowpass',
    filterQ: 1,
    filterFreq: 4000,
    filterAttack: 0.02,
    filterDecay: 0.2,
    filterSustain: 0.3,
    filterRelease: 0.5,
    filterOctaves: 3,
  }
}

export const useTracksStore = defineStore('tracks', {
  state: () => ({
    tracks: [], // { id, name, type, synth, sampleUrl, effects: [], volume, pan, mute, solo, color }
    selectedTrackId: null,
  }),

  getters: {
    selectedTrack: (state) =>
      state.tracks.find((t) => t.id === state.selectedTrackId) ?? null,
    soloedTracks: (state) => state.tracks.filter((t) => t.solo),
  },

  actions: {
    addTrack(type = 'synth', name = null) {
      const track = {
        id: nanoid(),
        name: name ?? (type === 'synth' ? `Voice ${this.tracks.length + 1}` : `Sample ${this.tracks.length + 1}`),
        type,
        synth: type === 'synth' ? defaultSynthParams() : null,
        sampleUrl: null,
        effects: [],
        volume: 0,
        pan: 0,
        mute: false,
        solo: false,
      }
      this.tracks.push(track)
      this.selectedTrackId = track.id
      return track
    },

    removeTrack(id) {
      this.tracks = this.tracks.filter((t) => t.id !== id)
      if (this.selectedTrackId === id) {
        this.selectedTrackId = this.tracks[0]?.id ?? null
      }
    },

    selectTrack(id) {
      this.selectedTrackId = id
    },

    updateSynthParam(id, key, value) {
      const track = this.tracks.find((t) => t.id === id)
      if (track?.synth) track.synth[key] = value
    },

    setVolume(id, db) {
      const track = this.tracks.find((t) => t.id === id)
      if (track) track.volume = db
    },

    setPan(id, pan) {
      const track = this.tracks.find((t) => t.id === id)
      if (track) track.pan = pan
    },

    toggleMute(id) {
      const track = this.tracks.find((t) => t.id === id)
      if (track) track.mute = !track.mute
    },

    toggleSolo(id) {
      const track = this.tracks.find((t) => t.id === id)
      if (track) track.solo = !track.solo
    },

    addEffect(trackId, effectType, params) {
      const track = this.tracks.find((t) => t.id === trackId)
      if (track) track.effects.push({ type: effectType, params })
    },

    removeEffect(trackId, index) {
      const track = this.tracks.find((t) => t.id === trackId)
      if (track) track.effects.splice(index, 1)
    },
  },
})
