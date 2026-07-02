<template>
  <div class="tracklist gb-panel">
    <div class="tracklist__header">
      <h3 class="gb-display">Voices</h3>
    </div>

    <div
      v-for="track in tracks.tracks"
      :key="track.id"
      class="tracklist__item"
      :class="{ 'tracklist__item--selected': track.id === tracks.selectedTrackId }"
      @click="tracks.selectTrack(track.id)"
    >
      <span class="tracklist__name">{{ track.name }}</span>
      <div class="tracklist__buttons">
        <button
          class="tracklist__mute"
          :class="{ 'tracklist__mute--on': track.mute }"
          @click.stop="tracks.toggleMute(track.id)"
        >M</button>
        <button
          class="tracklist__solo"
          :class="{ 'tracklist__solo--on': track.solo }"
          @click.stop="tracks.toggleSolo(track.id)"
        >S</button>
      </div>
    </div>

    <div class="tracklist__add">
      <button @click="tracks.addTrack('synth')">+ Synth</button>
      <button @click="tracks.addTrack('sampler')">+ Sample</button>
    </div>
  </div>
</template>

<script setup>
import { useTracksStore } from '../../stores/tracks.js'
const tracks = useTracksStore()
</script>

<style scoped>
.tracklist {
  padding: 12px;
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tracklist__header h3 {
  font-size: 14px;
  margin: 0 0 8px;
}

.tracklist__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  background: var(--gb-crypt-raised);
  border: var(--pixel) solid var(--gb-iron);
  cursor: pointer;
}

.tracklist__item--selected {
  border-color: var(--gb-phosphor);
}

.tracklist__name {
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tracklist__buttons {
  display: flex;
  gap: 4px;
}

.tracklist__mute, .tracklist__solo {
  width: 20px;
  height: 20px;
  font-size: 9px;
  background: var(--gb-iron-dim);
  border: 1px solid var(--gb-iron);
  color: var(--gb-bone-dim);
  cursor: pointer;
}

.tracklist__mute--on {
  background: var(--gb-blood);
  color: var(--gb-bone);
}

.tracklist__solo--on {
  background: var(--gb-phosphor);
  color: var(--gb-void);
}

.tracklist__add {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.tracklist__add button {
  flex: 1;
  background: var(--gb-crypt-raised);
  border: var(--pixel) dashed var(--gb-iron);
  color: var(--gb-bone-dim);
  font-family: var(--font-ui);
  font-size: 10px;
  padding: 6px 4px;
  cursor: pointer;
}

.tracklist__add button:hover {
  color: var(--gb-phosphor);
  border-color: var(--gb-phosphor);
}
</style>
