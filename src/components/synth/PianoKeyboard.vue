<template>
  <div class="piano gb-panel">
    <div class="piano__toolbar">
      <span class="piano__hint">
        Keys: A–; row plays notes · Z/X shift octave ({{ baseOctave }})
      </span>
      <button class="piano__midi" :class="{ 'piano__midi--on': midiConnected }" @click="connectMidi">
        {{ midiConnected ? 'MIDI connected' : 'Connect MIDI' }}
      </button>
    </div>

    <div class="piano__keys">
      <div
        v-for="key in keys"
        :key="key.note"
        class="piano__key"
        :class="[
          key.isBlack ? 'piano__key--black' : 'piano__key--white',
          { 'piano__key--active': activeNotes.has(key.note) },
        ]"
        :style="key.style"
        @pointerdown="noteOn(key.note)"
        @pointerup="noteOff(key.note)"
        @pointerleave="noteOff(key.note)"
      >
        <span v-if="!key.isBlack" class="piano__key-label">{{ key.note }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useTracksStore } from '../../stores/tracks.js'
import { useTransportStore } from '../../stores/transport.js'
import { useKeyboardInput } from '../../composables/useKeyboardInput.js'
import { getEngine } from '../../audio/registry.js'

const OCTAVE_RANGE = [3, 4, 5] // three octaves shown on screen
const NOTE_ORDER = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const tracks = useTracksStore()
const transport = useTransportStore()

const activeNotes = reactive(new Set())
const midiConnected = ref(false)

const keys = computed(() => {
  const whiteWidth = 34
  let whiteIndex = 0
  const result = []

  for (const octave of OCTAVE_RANGE) {
    for (const name of NOTE_ORDER) {
      const isBlack = name.includes('#')
      const note = `${name}${octave}`
      if (isBlack) {
        result.push({
          note,
          isBlack: true,
          style: { left: `${whiteIndex * whiteWidth - 9}px`, width: '18px' },
        })
      } else {
        result.push({
          note,
          isBlack: false,
          style: { left: `${whiteIndex * whiteWidth}px`, width: `${whiteWidth}px` },
        })
        whiteIndex++
      }
    }
  }
  return result
})

function currentEngine() {
  const trackId = tracks.selectedTrackId
  if (!trackId) return null
  return getEngine(trackId)
}

async function noteOn(note) {
  if (activeNotes.has(note)) return
  await transport.ensureAudio()
  activeNotes.add(note)
  currentEngine()?.triggerAttack(note)
}

function noteOff(note) {
  if (!activeNotes.has(note)) return
  activeNotes.delete(note)
  currentEngine()?.triggerRelease(note)
}

const { baseOctave } = useKeyboardInput({
  onNoteOn: noteOn,
  onNoteOff: noteOff,
})

// Web MIDI — connects real hardware/controllers when available.
async function connectMidi() {
  if (!navigator.requestMIDIAccess) {
    alert('Web MIDI is not supported in this browser.')
    return
  }
  try {
    const access = await navigator.requestMIDIAccess()
    for (const input of access.inputs.values()) {
      input.onmidimessage = handleMidiMessage
    }
    midiConnected.value = true
  } catch (err) {
    console.error('MIDI access denied', err)
  }
}

function handleMidiMessage(e) {
  const [status, note, velocity] = e.data
  const command = status & 0xf0
  const noteName = midiNoteToName(note)
  if (command === 0x90 && velocity > 0) {
    noteOn(noteName)
  } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
    noteOff(noteName)
  }
}

function midiNoteToName(midiNote) {
  const octave = Math.floor(midiNote / 12) - 1
  const name = NOTE_ORDER[midiNote % 12]
  return `${name}${octave}`
}
</script>

<style scoped>
.piano {
  padding: 12px;
}

.piano__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.piano__hint {
  font-size: 9px;
  color: var(--gb-bone-dim);
}

.piano__midi {
  background: var(--gb-crypt-raised);
  border: var(--pixel) solid var(--gb-iron);
  color: var(--gb-bone-dim);
  font-family: var(--font-ui);
  font-size: 9px;
  padding: 5px 8px;
  cursor: pointer;
}

.piano__midi--on {
  border-color: var(--gb-phosphor);
  color: var(--gb-phosphor);
}

.piano__keys {
  position: relative;
  height: 100px;
  user-select: none;
}

.piano__key {
  position: absolute;
  top: 0;
  cursor: pointer;
  transition: background 0.05s;
}

.piano__key--white {
  height: 100px;
  background: var(--gb-bone);
  border: 1px solid var(--gb-iron-dim);
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 4px;
}

.piano__key--black {
  height: 60px;
  background: var(--gb-void);
  border: 1px solid #000;
  z-index: 2;
}

.piano__key--white.piano__key--active {
  background: var(--gb-phosphor);
}

.piano__key--black.piano__key--active {
  background: var(--gb-blood);
}

.piano__key-label {
  font-size: 7px;
  color: var(--gb-void);
}
</style>
