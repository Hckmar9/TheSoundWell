<template>
  <div
    class="container"
    :style="{ backgroundImage: `url(${backgroundImage})` }"
  >
    <h1>The SoundWell tunes</h1>
    <div class="button-container">
      <button
        v-for="sound in SOUNDS"
        :key="sound"
        @click="playSound(sound)"
        :class="{ active: currentSound === sound }"
      >
        {{ sound }}
      </button>
      <button @click="stopSound" :disabled="!currentSound" class="stop-button">
        Stop
      </button>
    </div>

    <div class="volume-control">
      <label for="volume">Volume:</label>
      <input
        type="range"
        id="volume"
        v-model="volume"
        min="0"
        max="1"
        step="0.1"
        @input="setVolume"
      />
    </div>
  </div>
  <Analytics />
</template>

<script>
import { onMounted, ref } from "vue";
import { useAudio, SOUNDS } from "./composables/useAudio";

export default {
  setup() {
    const { currentSound, playSound, stopSound, preloadSounds, setVolume } =
      useAudio();
    const volume = ref(1); // Default volume set to max

    onMounted(() => {
      preloadSounds();
    });

    return {
      SOUNDS,
      currentSound,
      playSound,
      stopSound,
      volume,
      setVolume: () => setVolume(volume.value),
    };
  },
};
</script>
