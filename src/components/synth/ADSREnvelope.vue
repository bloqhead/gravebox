<template>
  <div class="adsr gb-panel">
    <h4 class="adsr__title gb-display">Envelope</h4>

    <svg viewBox="0 0 120 40" class="adsr__curve" preserveAspectRatio="none">
      <polyline :points="curvePoints" fill="none" stroke="var(--gb-phosphor)" stroke-width="1.5" />
      <polyline :points="curveFill" fill="rgba(79,209,197,0.12)" stroke="none" />
    </svg>

    <div class="adsr__knobs">
      <PixelKnob
        label="Attack" unit="s" :min="0.001" :max="2" :step="0.01"
        :model-value="modelValue.attack"
        @update:modelValue="(v) => emit('update', 'attack', v)"
      />
      <PixelKnob
        label="Decay" unit="s" :min="0.001" :max="2" :step="0.01"
        :model-value="modelValue.decay"
        @update:modelValue="(v) => emit('update', 'decay', v)"
      />
      <PixelKnob
        label="Sustain" unit="" :min="0" :max="1" :step="0.01"
        :model-value="modelValue.sustain"
        @update:modelValue="(v) => emit('update', 'sustain', v)"
      />
      <PixelKnob
        label="Release" unit="s" :min="0.001" :max="4" :step="0.01"
        :model-value="modelValue.release"
        @update:modelValue="(v) => emit('update', 'release', v)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PixelKnob from '../controls/PixelKnob.vue'

const props = defineProps({
  modelValue: { type: Object, required: true }, // track.synth
})
const emit = defineEmits(['update'])

// Map ADSR values onto a fixed-width SVG timeline for visualization.
// Attack/decay/release each get a proportional slice of a 120-unit width;
// sustain is a height (0-1) held over a fixed middle segment.
const curvePoints = computed(() => {
  const { attack, decay, sustain, release } = props.modelValue
  const totalTime = attack + decay + 0.3 + release // 0.3 = fixed sustain hold for drawing
  const scale = 100 / Math.max(totalTime, 0.1)

  const x0 = 0, y0 = 38
  const x1 = attack * scale, y1 = 2
  const x2 = x1 + decay * scale, y2 = 2 + (1 - sustain) * 36
  const x3 = x2 + 0.3 * scale, y3 = y2
  const x4 = x3 + release * scale, y4 = 38

  return `${x0},${y0} ${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`
})

const curveFill = computed(() => `${curvePoints.value} 120,40 0,40`)
</script>

<style scoped>
.adsr {
  padding: 12px;
}

.adsr__title {
  font-size: 13px;
  margin: 0 0 10px;
}

.adsr__curve {
  width: 100%;
  height: 60px;
  background: var(--gb-void);
  border: var(--pixel) solid var(--gb-iron-dim);
  margin-bottom: 10px;
}

.adsr__knobs {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
</style>
