<template>
  <div class="app">
    <header class="app__header">
      <h1 class="gb-display app__logo">GRAVEBOX</h1>
      <span class="app__subtitle">a groovebox for the crypt</span>
    </header>

    <TransportBar class="app__transport" />

    <main class="app__body">
      <TrackList class="app__tracklist" />
      <StepGrid class="app__grid" />
    </main>

    <div v-if="!transport.audioReady" class="app__start-overlay" @click="startAudio">
      <div class="app__start-box gb-panel">
        <p class="gb-display">Click to awaken the machine</p>
        <p class="app__start-hint">(browsers require a gesture to unlock audio)</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTransportStore } from './stores/transport.js'
import { useTracksStore } from './stores/tracks.js'
import { useProjectStore } from './stores/project.js'
import { SequencerBridge } from './audio/SequencerBridge.js'
import TransportBar from './components/controls/TransportBar.vue'
import TrackList from './components/tracks/TrackList.vue'
import StepGrid from './components/sequencer/StepGrid.vue'

const transport = useTransportStore()
const tracks = useTracksStore()
const project = useProjectStore()

async function startAudio() {
  await transport.ensureAudio()
}

onMounted(() => {
  // Seed a starter project so the grid isn't empty on first load
  const kick = tracks.addTrack('synth', 'Kick')
  const hat = tracks.addTrack('synth', 'Hat')
  const patternId = project.createPattern('Pattern I')
  project.ensureTrackInPattern(patternId, kick.id)
  project.ensureTrackInPattern(patternId, hat.id)
  project.appendToArrangement(patternId)

  new SequencerBridge(tracks, project, transport)
})
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  gap: 14px;
  position: relative;
}

.app__header {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.app__logo {
  font-size: 28px;
  margin: 0;
  letter-spacing: 2px;
}

.app__subtitle {
  color: var(--gb-bone-dim);
  font-size: 11px;
  text-transform: lowercase;
}

.app__body {
  display: flex;
  gap: 14px;
  flex: 1;
  min-height: 0;
}

.app__grid {
  flex: 1;
  overflow: auto;
}

.app__start-overlay {
  position: fixed;
  inset: 0;
  background: rgba(18, 14, 24, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
}

.app__start-box {
  padding: 32px 48px;
  text-align: center;
}

.app__start-hint {
  color: var(--gb-bone-dim);
  font-size: 10px;
  margin-top: 8px;
}
</style>
