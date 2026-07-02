<template>
  <div class="slider" :class="[`slider--${orientation}`]">
    <span v-if="label" class="slider__label">{{ label }}</span>
    <div class="slider__track" ref="trackRef" @pointerdown="startDrag">
      <div class="slider__fill" :style="fillStyle" />
      <div class="slider__thumb" :style="thumbStyle" />
    </div>
    <span class="slider__value">{{ displayValue }}</span>
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
  orientation: { type: String, default: 'vertical' }, // 'vertical' | 'horizontal'
})
const emit = defineEmits(['update:modelValue'])

const trackRef = ref(null)

const pct = computed(() => (props.modelValue - props.min) / (props.max - props.min))

const fillStyle = computed(() =>
  props.orientation === 'vertical'
    ? { height: `${pct.value * 100}%` }
    : { width: `${pct.value * 100}%` }
)

const thumbStyle = computed(() =>
  props.orientation === 'vertical'
    ? { bottom: `${pct.value * 100}%` }
    : { left: `${pct.value * 100}%` }
)

const displayValue = computed(() => {
  const v = Number.isInteger(props.step) ? Math.round(props.modelValue) : props.modelValue.toFixed(2)
  return `${v}${props.unit}`
})

function valueFromEvent(e) {
  const rect = trackRef.value.getBoundingClientRect()
  let ratio
  if (props.orientation === 'vertical') {
    ratio = 1 - (e.clientY - rect.top) / rect.height
  } else {
    ratio = (e.clientX - rect.left) / rect.width
  }
  ratio = Math.min(1, Math.max(0, ratio))
  const raw = props.min + ratio * (props.max - props.min)
  return Math.round(raw / props.step) * props.step
}

function startDrag(e) {
  emit('update:modelValue', valueFromEvent(e))
  function onMove(ev) {
    emit('update:modelValue', valueFromEvent(ev))
  }
  function onUp() {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}
</script>

<style scoped>
.slider {
  display: flex;
  align-items: center;
  gap: 6px;
  user-select: none;
}

.slider--vertical {
  flex-direction: column;
  height: 100px;
}

.slider--horizontal {
  flex-direction: row;
  width: 140px;
}

.slider__label {
  font-size: 9px;
  color: var(--gb-bone-dim);
  text-transform: uppercase;
}

.slider__track {
  position: relative;
  background: var(--gb-iron-dim);
  border: var(--pixel) solid var(--gb-iron);
  cursor: pointer;
}

.slider--vertical .slider__track {
  width: 10px;
  flex: 1;
}

.slider--horizontal .slider__track {
  height: 10px;
  flex: 1;
}

.slider__fill {
  position: absolute;
  left: 0;
  bottom: 0;
  background: linear-gradient(0deg, var(--gb-blood), var(--gb-phosphor));
  transition: height 0.05s linear, width 0.05s linear;
}

.slider--horizontal .slider__fill {
  bottom: auto;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, var(--gb-blood), var(--gb-phosphor));
}

.slider__thumb {
  position: absolute;
  width: 16px;
  height: 6px;
  background: var(--gb-bone);
  left: -3px;
  transform: translateY(50%);
  box-shadow: 0 0 4px rgba(0,0,0,0.6);
}

.slider--horizontal .slider__thumb {
  width: 6px;
  height: 16px;
  left: auto;
  top: -3px;
  transform: translateX(-50%);
}

.slider__value {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--gb-phosphor);
  min-width: 28px;
  text-align: center;
}
</style>
