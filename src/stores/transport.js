import { defineStore } from 'pinia'
import * as engine from '../audio/engine.js'

export const useTransportStore = defineStore('transport', {
  state: () => ({
    isPlaying: false,
    isRecording: false,
    bpm: 120,
    swing: 0,
    currentStep: 0,
    currentBar: 0,
    metronomeOn: false,
    audioReady: false,
  }),

  actions: {
    async ensureAudio() {
      await engine.initAudio()
      this.audioReady = true
    },

    async togglePlay() {
      await this.ensureAudio()
      if (this.isPlaying) {
        engine.stop()
        this.isPlaying = false
        this.currentStep = 0
        this.currentBar = 0
      } else {
        engine.play()
        this.isPlaying = true
      }
    },

    setBpm(value) {
      this.bpm = Math.min(300, Math.max(20, value))
      engine.setBpm(this.bpm)
    },

    setSwing(value) {
      this.swing = Math.min(1, Math.max(0, value))
      engine.setSwing(this.swing)
    },

    toggleMetronome() {
      this.metronomeOn = !this.metronomeOn
    },

    setStep(step, bar) {
      this.currentStep = step
      this.currentBar = bar
    },
  },
})
