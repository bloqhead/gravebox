import { defineStore } from 'pinia'
import { nanoid } from '../utils/id.js'

const STEPS_PER_PATTERN = 16

function emptySteps(count = STEPS_PER_PATTERN) {
  return Array.from({ length: count }, () => ({
    active: false,
    note: 'C4',
    velocity: 1,
    duration: '16n',
  }))
}

export const useProjectStore = defineStore('project', {
  state: () => ({
    name: 'untitled requiem',
    patterns: {},      // { [patternId]: { name, length, tracks: { [trackId]: { steps: [] } } } }
    arrangement: [],   // [{ patternId }] — ordered list = the song
    activePatternId: null,
  }),

  getters: {
    activePattern: (state) =>
      state.activePatternId ? state.patterns[state.activePatternId] : null,
  },

  actions: {
    createPattern(name = 'Pattern') {
      const id = nanoid()
      this.patterns[id] = { id, name, length: STEPS_PER_PATTERN, tracks: {} }
      if (!this.activePatternId) this.activePatternId = id
      return id
    },

    ensureTrackInPattern(patternId, trackId) {
      const pattern = this.patterns[patternId]
      if (!pattern) return
      if (!pattern.tracks[trackId]) {
        pattern.tracks[trackId] = { steps: emptySteps(pattern.length) }
      }
    },

    toggleStep(patternId, trackId, stepIndex) {
      this.ensureTrackInPattern(patternId, trackId)
      const step = this.patterns[patternId].tracks[trackId].steps[stepIndex]
      step.active = !step.active
    },

    setStepNote(patternId, trackId, stepIndex, note) {
      this.ensureTrackInPattern(patternId, trackId)
      this.patterns[patternId].tracks[trackId].steps[stepIndex].note = note
    },

    setStepVelocity(patternId, trackId, stepIndex, velocity) {
      this.ensureTrackInPattern(patternId, trackId)
      this.patterns[patternId].tracks[trackId].steps[stepIndex].velocity = velocity
    },

    setActivePattern(id) {
      this.activePatternId = id
    },

    appendToArrangement(patternId) {
      this.arrangement.push({ patternId })
    },

    removeFromArrangement(index) {
      this.arrangement.splice(index, 1)
    },

    randomizePattern(patternId, trackId, density = 0.3) {
      this.ensureTrackInPattern(patternId, trackId)
      const steps = this.patterns[patternId].tracks[trackId].steps
      steps.forEach((step) => {
        step.active = Math.random() < density
        step.velocity = 0.6 + Math.random() * 0.4
      })
    },
  },
})
