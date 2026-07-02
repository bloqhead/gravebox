import { onMounted, onUnmounted, ref } from 'vue'

// Standard "typing piano" layout: bottom row = white/black keys of one
// octave, top row continues into the next. z/x shift octave down/up.
const KEY_TO_SEMITONE = {
  a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7, y: 8, h: 9, u: 10, j: 11,
  k: 12, o: 13, l: 14, p: 15, ';': 16,
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function semitoneToNote(semitone, baseOctave) {
  const octave = baseOctave + Math.floor(semitone / 12)
  const name = NOTE_NAMES[semitone % 12]
  return `${name}${octave}`
}

/**
 * Emits note-on/note-off from QWERTY keys. `onNoteOn`/`onNoteOff` receive
 * a note name like 'C4'. Ignores key-repeat events so held keys don't
 * retrigger the envelope.
 */
export function useKeyboardInput({ onNoteOn, onNoteOff }) {
  const baseOctave = ref(4)
  const heldKeys = new Set()

  function handleKeyDown(e) {
    if (e.repeat) return
    if (e.target.tagName === 'INPUT') return

    const key = e.key.toLowerCase()
    if (key === 'z') {
      baseOctave.value = Math.max(1, baseOctave.value - 1)
      return
    }
    if (key === 'x') {
      baseOctave.value = Math.min(7, baseOctave.value + 1)
      return
    }

    const semitone = KEY_TO_SEMITONE[key]
    if (semitone === undefined || heldKeys.has(key)) return
    heldKeys.add(key)
    onNoteOn?.(semitoneToNote(semitone, baseOctave.value))
  }

  function handleKeyUp(e) {
    const key = e.key.toLowerCase()
    const semitone = KEY_TO_SEMITONE[key]
    if (semitone === undefined) return
    heldKeys.delete(key)
    onNoteOff?.(semitoneToNote(semitone, baseOctave.value))
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
  })

  return { baseOctave }
}
