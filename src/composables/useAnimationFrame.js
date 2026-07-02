import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Runs `callback(deltaMs)` every animation frame while active.
 * Used for the spectrum visualizer and playhead redraw — kept off
 * Vue's reactivity system since it needs to run at display refresh rate.
 */
export function useAnimationFrame(callback) {
  const active = ref(true)
  let frameId = null
  let lastTime = performance.now()

  function tick(now) {
    const delta = now - lastTime
    lastTime = now
    if (active.value) callback(delta)
    frameId = requestAnimationFrame(tick)
  }

  onMounted(() => {
    frameId = requestAnimationFrame(tick)
  })

  onUnmounted(() => {
    if (frameId) cancelAnimationFrame(frameId)
  })

  return {
    pause: () => (active.value = false),
    resume: () => (active.value = true),
  }
}
