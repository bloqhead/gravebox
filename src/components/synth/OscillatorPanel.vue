<template>
  <div class="osc gb-panel">
    <h4 class="osc__title gb-display">Oscillator</h4>
    <div class="osc__waves">
      <button
        v-for="wave in waves"
        :key="wave.type"
        class="osc__wave"
        :class="{ 'osc__wave--active': modelValue.oscType === wave.type }"
        @click="setWave(wave.type)"
        :title="wave.label"
      >
        <svg viewBox="0 0 24 12" class="osc__icon">
          <path :d="wave.path" fill="none" stroke="currentColor" stroke-width="1.5" />
        </svg>
        <span class="osc__wave-label">{{ wave.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Object, required: true }, // track.synth
})
const emit = defineEmits(['update'])

const waves = [
  { type: 'sine', label: 'Sine', path: 'M0,6 Q6,0 12,6 T24,6' },
  { type: 'sawtooth', label: 'Saw', path: 'M0,10 L8,2 L8,10 L16,2 L16,10 L24,2' },
  { type: 'square', label: 'Square', path: 'M0,10 L0,2 L12,2 L12,10 L24,10 L24,2' },
  { type: 'triangle', label: 'Triangle', path: 'M0,10 L6,2 L12,10 L18,2 L24,10' },
]

function setWave(type) {
  emit('update', 'oscType', type)
}
</script>

<style scoped>
.osc {
  padding: 12px;
}

.osc__title {
  font-size: 13px;
  margin: 0 0 10px;
}

.osc__waves {
  display: flex;
  gap: 6px;
}

.osc__wave {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: var(--gb-crypt-raised);
  border: var(--pixel) solid var(--gb-iron);
  color: var(--gb-bone-dim);
  padding: 8px 4px;
  cursor: pointer;
}

.osc__wave--active {
  border-color: var(--gb-phosphor);
  color: var(--gb-phosphor);
  box-shadow: 0 0 6px rgba(79, 209, 197, 0.4);
}

.osc__icon {
  width: 24px;
  height: 12px;
}

.osc__wave-label {
  font-size: 8px;
  text-transform: uppercase;
}
</style>
