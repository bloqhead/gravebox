<template>
  <button
    class="step"
    :class="{
      'step--active': step.active,
      'step--current': isCurrent,
      'step--beat': isBeatMarker,
      'gb-ember': step.active,
    }"
    @click="$emit('toggle')"
    :aria-pressed="step.active"
    :aria-label="`Step ${index + 1}${step.active ? ', active' : ''}`"
  />
</template>

<script setup>
defineProps({
  step: { type: Object, required: true },
  index: { type: Number, required: true },
  isCurrent: { type: Boolean, default: false },
  isBeatMarker: { type: Boolean, default: false },
})
defineEmits(['toggle'])
</script>

<style scoped>
.step {
  width: 26px;
  height: 26px;
  background: var(--gb-iron-dim);
  border: var(--pixel) solid var(--gb-iron);
  cursor: pointer;
  padding: 0;
  transition: background 0.08s, border-color 0.08s;
}

.step:hover {
  border-color: var(--gb-bone-dim);
}

.step--beat {
  border-left-color: var(--gb-bone-dim);
}

.step--active {
  background: var(--gb-blood);
  border-color: var(--gb-blood-glow);
  box-shadow: 0 0 6px rgba(176,34,63,0.6);
}

.step--current {
  outline: 2px solid var(--gb-phosphor);
  outline-offset: 1px;
}

.step--current.step--active {
  background: var(--gb-phosphor);
  border-color: var(--gb-phosphor-glow);
  box-shadow: 0 0 8px var(--gb-phosphor-glow);
}
</style>
