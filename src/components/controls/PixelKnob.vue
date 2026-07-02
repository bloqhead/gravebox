<template>
  <div class="knob-wrap">
    <div
      class="knob"
      :class="{ 'knob--active': active }"
      @pointerdown="startDrag"
      role="slider"
      :aria-valuenow="modelValue"
      :aria-valuemin="min"
      :aria-valuemax="max"
      tabindex="0"
      @keydown.up.prevent="nudge(step)"
      @keydown.down.prevent="nudge(-step)"
    >
      <div class="knob__body" :style="{ transform: `rotate(${angle}deg)` }">
        <div class="knob__indicator" />
      </div>
    </div>
    <span class="knob__label">{{ label }}</span>
    <span class="knob__value">{{ displayValue }}</span>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
  label: { type: String, default: '' },
  unit: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const active = ref(false)

// Map value range to a -135deg..135deg sweep (270deg of rotation)
const angle = computed(() => {
  const pct = (props.modelValue - props.min) / (props.max - props.min)
  return -135 + pct * 270
})

const displayValue = computed(() => {
  const v = Number.isInteger(props.step) ? Math.round(props.modelValue) : props.modelValue.toFixed(2)
  return `${v}${props.unit}`
})

function nudge(delta) {
  const next = Math.min(props.max, Math.max(props.min, props.modelValue + delta))
  emit('update:modelValue', next)
}

function startDrag(e) {
  active.value = true
  const startY = e.clientY
  const startVal = props.modelValue
  const range = props.max - props.min

  function onMove(ev) {
    const deltaY = startY - ev.clientY
    const deltaVal = (deltaY / 150) * range
    const next = Math.min(props.max, Math.max(props.min, startVal + deltaVal))
    emit('update:modelValue', Math.round(next / props.step) * props.step)
  }
  function onUp() {
    active.value = false
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}
</script>

<style scoped>
.knob-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  user-select: none;
}

.knob {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--gb-crypt-raised);
  border: var(--pixel) solid var(--gb-iron);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ns-resize;
  position: relative;
  transition: box-shadow 0.15s;
}

.knob:focus-visible {
  outline: 2px solid var(--gb-phosphor);
  outline-offset: 2px;
}

.knob--active {
  animation: gb-knob-glow 0.6s infinite;
  border-color: var(--gb-phosphor);
}

.knob__body {
  width: 100%;
  height: 100%;
  position: relative;
}

.knob__indicator {
  position: absolute;
  top: 3px;
  left: 50%;
  width: 3px;
  height: 14px;
  background: var(--gb-blood);
  transform: translateX(-50%);
}

.knob--active .knob__indicator {
  background: var(--gb-phosphor);
}

.knob__label {
  font-size: 9px;
  color: var(--gb-bone-dim);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.knob__value {
  font-size: 10px;
  color: var(--gb-phosphor);
}
</style>
