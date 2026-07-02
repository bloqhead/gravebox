<template>
  <div class="synth-editor">
    <div v-if="!track" class="synth-editor__empty gb-panel">
      Select a voice to edit it.
    </div>

    <div v-else-if="track.type !== 'synth'" class="synth-editor__empty gb-panel">
      "{{ track.name }}" is a sample track — the sampler editor is coming soon.
    </div>

    <template v-else>
      <div class="synth-editor__panels">
        <OscillatorPanel :model-value="track.synth" @update="updateParam" />
        <FilterPanel :model-value="track.synth" @update="updateParam" />
        <ADSREnvelope :model-value="track.synth" @update="updateParam" />
      </div>
      <PianoKeyboard />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTracksStore } from '../../stores/tracks.js'
import OscillatorPanel from './OscillatorPanel.vue'
import ADSREnvelope from './ADSREnvelope.vue'
import FilterPanel from './FilterPanel.vue'
import PianoKeyboard from './PianoKeyboard.vue'

const tracks = useTracksStore()
const track = computed(() => tracks.selectedTrack)

function updateParam(key, value) {
  if (!track.value) return
  tracks.updateSynthParam(track.value.id, key, value)
}
</script>

<style scoped>
.synth-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.synth-editor__empty {
  padding: 24px;
  text-align: center;
  color: var(--gb-bone-dim);
}

.synth-editor__panels {
  display: flex;
  gap: 12px;
}

.synth-editor__panels > * {
  flex: 1;
}
</style>
