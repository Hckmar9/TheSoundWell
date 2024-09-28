<template>
  <div
    class="container"
    :style="{ backgroundImage: `url(${backgroundImage})` }"
  >
    <h1>Background Sounds</h1>
    <div class="button-container">
      <button
        v-for="sound in sounds"
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
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";

export default {
  setup() {
    const sounds = [
      "rain-1",
      "rain-2",
      "lake",
      "storm",
      "night",
      "ac",
      "ocean",
      "forest-1",
    ];
    let audioContext = null;
    let source = null;
    const currentSound = ref(null);

    const playSound = async (soundName) => {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }

      if (source) {
        stopSound();
      }

      try {
        const response = await fetch(`sounds/${soundName}.mp3`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.loop = true; // Ensure looping is enabled
        source.start(0); // Start playing immediately
        currentSound.value = soundName;

        // Add event listener for when the sound ends (although it shouldn't with loop enabled)
        source.onended = () => {
          if (currentSound.value === soundName) {
            source.start(0); // Restart the sound if it somehow ends
          }
        };
      } catch (e) {
        console.error("Error with sound loading", e);
      }
    };

    const stopSound = () => {
      if (source) {
        source.stop();
        source.onended = null; // Remove the event listener
        source = null;
        currentSound.value = null;
      }
    };

    onMounted(() => {
      // Preload sounds if needed
      sounds.forEach((sound) => {
        const audio = new Audio(`sounds/${sound}.mp3`);
        audio.preload = "auto";
      });
    });

    onUnmounted(() => {
      stopSound();
      if (audioContext) {
        audioContext.close();
      }
    });

    return {
      sounds,
      currentSound,
      playSound,
      stopSound,
    };
  },
};
</script>
