<template>
  <div class="filter gb-panel">
    <h4 class="filter__title gb-display">Filter</h4>

    <div class="filter__types">
      <button
        v-for="type in types"
        :key="type"
        class="filter__type"
        :class="{ 'filter__type--active': modelValue.filterType === type }"
        @click="emit('update', 'filterType', type)"
      >
        {{ type }}
      </button>
    </div>

    <div class="filter__knobs">
      <PixelKnob
        label="Cutoff" unit="Hz" :min="20" :max="12000" :step="10"
        :model-value="modelValue.filterFreq"
        @update:modelValue="(v) => emit('update', 'filterFreq', v)"
      />
      <PixelKnob
        label="Resonance" unit="" :min="0.1" :max="20" :step="0.1"
        :model-value="modelValue.filterQ"
        @update:modelValue="(v) => emit('update', 'filterQ', v)"
      />
      <PixelKnob
        label="Env Amt" unit="oct" :min="0" :max="7" :step="0.5"
        :model-value="modelValue.filterOctaves"
        @update:modelValue="(v) => emit('update', 'filterOctaves', v)"
      />
      <PixelKnob
        label="Env Rel" unit="s" :min="0.01" :max="4" :step="0.01"
        :model-value="modelValue.filterRelease"
        @update:modelValue="(v) => emit('update', 'filterRelease', v)"
      />
    </div>
  </div>
</template>

<script setup>
import PixelKnob from '../controls/PixelKnob.vue'

defineProps({
  modelValue: { type: Object, required: true }, // track.synth
})
const emit = defineEmits(['update'])

const types = ['lowpass', 'highpass', 'bandpass']
</script>

<style scoped>
.filter {
  padding: 12px;
}

.filter__title {
  font-size: 13px;
  margin: 0 0 10px;
}

.filter__types {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.filter__type {
  flex: 1;
  background: var(--gb-crypt-raised);
  border: var(--pixel) solid var(--gb-iron);
  color: var(--gb-bone-dim);
  font-family: var(--font-ui);
  font-size: 9px;
  text-transform: uppercase;
  padding: 6px 4px;
  cursor: pointer;
}

.filter__type--active {
  border-color: var(--gb-blood);
  color: var(--gb-blood-glow);
  box-shadow: 0 0 6px rgba(176, 34, 63, 0.4);
}

.filter__knobs {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
</style>
