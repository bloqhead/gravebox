import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    activeView: 'sequencer', // 'sequencer' | 'pianoroll' | 'mixer' | 'arrangement'
    activeModal: null,        // 'sampleBrowser' | 'projectMenu' | null
  }),

  actions: {
    setView(view) {
      this.activeView = view
    },
    openModal(modal) {
      this.activeModal = modal
    },
    closeModal() {
      this.activeModal = null
    },
  },
})
