<template>
  <div class="transport gb-panel">
    <button
      class="transport__play"
      :class="{ 'gb-pulse': transport.isPlaying }"
      @click="transport.togglePlay()"
      :aria-label="transport.isPlaying ? 'Stop' : 'Play'"
    >
      {{ transport.isPlaying ? '■' : '▶' }}
    </button>

    <button
      class="transport__record"
      :class="{ 'transport__record--on': transport.isRecording }"
      @click="transport.isRecording = !transport.isRecording"
      aria-label="Toggle record"
    >
      ●
    </button>

    <div class="transport__tempo">
      <label class="transport__tempo-label">BPM</label>
      <input
        type="number"
        class="transport__tempo-input"
        :value="transport.bpm"
        min="20"
        max="300"
        @change="transport.setBpm(Number($event.target.value))"
      />
    </div>

    <PixelSlider
      class="transport__swing"
      orientation="horizontal"
      :model-value="transport.swing * 100"
      :min="0" :max="100" :step="1"
      unit="%"
      label="Swing"
      @update:modelValue="(v) => transport.setSwing(v / 100)"
    />

    <button
      class="transport__metronome"
      :class="{ 'transport__metronome--on': transport.metronomeOn }"
      @click="transport.toggleMetronome()"
    >
      ♩ Metronome
    </button>

    <div class="transport__step-readout">
      Step {{ String(transport.currentStep + 1).padStart(2, '0') }}
    </div>
  </div>
</template>

<script setup>
import { useTransportStore } from '../../stores/transport.js'
import PixelSlider from './PixelSlider.vue'

const transport = useTransportStore()
</script>

<style scoped>
.transport {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
}

.transport__play,
.transport__record,
.transport__metronome {
  background: var(--gb-crypt-raised);
  border: var(--pixel) solid var(--gb-iron);
  color: var(--gb-bone);
  font-family: var(--font-ui);
  cursor: pointer;
  padding: 8px 12px;
}

.transport__play {
  color: var(--gb-phosphor);
  font-size: 16px;
  min-width: 44px;
}

.transport__record {
  color: var(--gb-blood);
  border-radius: 50%;
  width: 34px;
  height: 34px;
}

.transport__record--on {
  background: var(--gb-blood);
  color: var(--gb-bone);
}

.transport__metronome--on {
  border-color: var(--gb-phosphor);
  color: var(--gb-phosphor);
}

.transport__tempo {
  display: flex;
  align-items: center;
  gap: 6px;
}

.transport__tempo-label {
  font-size: 9px;
  color: var(--gb-bone-dim);
}

.transport__tempo-input {
  width: 52px;
  background: var(--gb-iron-dim);
  border: var(--pixel) solid var(--gb-iron);
  color: var(--gb-phosphor);
  font-family: var(--font-ui);
  padding: 6px;
  text-align: center;
}

.transport__step-readout {
  margin-left: auto;
  color: var(--gb-bone-dim);
  font-size: 11px;
}
</style>
