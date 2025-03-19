import { ref, onUnmounted, Ref, computed } from "vue";
export const SOUNDS = [
  "rain-1",
  "rain-2",
  "lake",
  "storm",
  "night",
  "ac",
  "ocean",
  "forest-1",
] as const;

export type Sound = (typeof SOUNDS)[number];

export function useAudio() {
  const audioContext: Ref<AudioContext | null> = ref(null);
  const source: Ref<AudioBufferSourceNode | null> = ref(null);
  const currentSound: Ref<Sound | null> = ref(null);
  const audioBuffers: Record<Sound, AudioBuffer | null> = Object.fromEntries(
    SOUNDS.map((sound) => [sound, null])
  ) as Record<Sound, AudioBuffer | null>;

  const gainNode: Ref<GainNode | null> = ref(null);
  const volume = ref(1); // 0 to 1

  const initAudioContext = (): void => {
    if (!audioContext.value) {
      audioContext.value = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      gainNode.value = audioContext.value.createGain();
      gainNode.value.connect(audioContext.value.destination);
    }
  };

  const setVolume = (newVolume: number): void => {
    volume.value = Math.max(0, Math.min(1, newVolume));
    if (gainNode.value) {
      gainNode.value.gain.setValueAtTime(
        volume.value,
        audioContext.value?.currentTime || 0
      );
    }
  };

  const loadSound = async (soundName: Sound): Promise<AudioBuffer> => {
    if (!audioContext.value) throw new Error("AudioContext not initialized");

    const response = await fetch(`sounds/${soundName}.mp3`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.value.decodeAudioData(arrayBuffer);
  };

  const createAndStartSource = (
    audioBuffer: AudioBuffer,
    soundName: Sound
  ): void => {
    if (!audioContext.value || !gainNode.value)
      throw new Error("AudioContext not initialized");

    source.value = audioContext.value.createBufferSource();
    source.value.buffer = audioBuffer;
    source.value.connect(gainNode.value);
    source.value.loop = true;
    source.value.start(0);
    currentSound.value = soundName;

    source.value.onended = () => {
      if (currentSound.value === soundName) {
        source.value?.start(0);
      }
    };
  };

  const playSound = async (soundName: Sound): Promise<void> => {
    initAudioContext();

    if (source.value) {
      stopSound();
    }

    try {
      let audioBuffer = audioBuffers[soundName];
      if (!audioBuffer) {
        audioBuffer = await loadSound(soundName);
        audioBuffers[soundName] = audioBuffer;
      }
      createAndStartSource(audioBuffer, soundName);
    } catch (e) {
      console.error(`Error playing sound ${soundName}:`, e);
    }
  };

  const stopSound = (): void => {
    if (source.value) {
      source.value.stop();
      source.value.onended = null;
      source.value = null;
      currentSound.value = null;
    }
  };

  const preloadSounds = async (): Promise<void> => {
    initAudioContext();
    if (!audioContext.value) throw new Error("AudioContext not initialized");

    const loadPromises = SOUNDS.map(async (sound) => {
      try {
        audioBuffers[sound] = await loadSound(sound);
      } catch (error) {
        console.error(`Failed to preload sound: ${sound}`, error);
      }
    });

    await Promise.all(loadPromises);
  };

  onUnmounted(() => {
    stopSound();
    if (audioContext.value) {
      audioContext.value.close();
    }
  });

  return {
    currentSound,
    playSound,
    stopSound,
    preloadSounds,
    setVolume,
    volume: computed(() => volume.value),
  };
}
