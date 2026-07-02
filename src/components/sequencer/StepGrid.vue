<template>
  <div class="grid gb-panel">
    <div class="grid__header">
      <h2 class="gb-display">{{ activePattern?.name ?? 'no pattern' }}</h2>
      <button class="grid__randomize" @click="randomize">🎲 Randomize</button>
    </div>

    <div v-if="!activePattern" class="grid__empty">
      Summon a pattern to begin.
    </div>

    <div v-else class="grid__rows">
      <div v-for="track in tracks.tracks" :key="track.id" class="grid__row">
        <div class="grid__row-label" :style="{ color: rowColor(track.id) }">
          {{ track.name }}
        </div>
        <div class="grid__steps">
          <StepCell
            v-for="(step, i) in stepsFor(track.id)"
            :key="i"
            :step="step"
            :index="i"
            :is-current="transport.currentStep === i && transport.isPlaying"
            :is-beat-marker="i % 4 === 0"
            @toggle="project.toggleStep(activePattern.id, track.id, i)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProjectStore } from '../../stores/project.js'
import { useTracksStore } from '../../stores/tracks.js'
import { useTransportStore } from '../../stores/transport.js'
import StepCell from './StepCell.vue'

const project = useProjectStore()
const tracks = useTracksStore()
const transport = useTransportStore()

const activePattern = computed(() => project.activePattern)

function stepsFor(trackId) {
  if (!activePattern.value) return []
  project.ensureTrackInPattern(activePattern.value.id, trackId)
  return activePattern.value.tracks[trackId]?.steps ?? []
}

function rowColor(trackId) {
  return trackId === tracks.selectedTrackId ? 'var(--gb-phosphor)' : 'var(--gb-bone-dim)'
}

function randomize() {
  if (!activePattern.value || !tracks.selectedTrackId) return
  project.randomizePattern(activePattern.value.id, tracks.selectedTrackId)
}
</script>

<style scoped>
.grid {
  padding: 16px;
}

.grid__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.grid__randomize {
  background: var(--gb-crypt-raised);
  border: var(--pixel) solid var(--gb-iron);
  color: var(--gb-bone);
  font-family: var(--font-ui);
  padding: 6px 10px;
  cursor: pointer;
}

.grid__randomize:hover {
  border-color: var(--gb-phosphor);
  color: var(--gb-phosphor);
}

.grid__empty {
  color: var(--gb-bone-dim);
  padding: 24px 0;
  text-align: center;
}

.grid__row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
  width: 100%;
}

.grid__row-label {
  width: 100px;
  flex-shrink: 0;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.grid__steps {
  display: flex;
  gap: 4px;
  flex: 1;
  min-width: 0;
}
</style>
