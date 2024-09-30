import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAudio } from '../useAudio'

class MockAudioContext {
  createGain() {
    return { connect: vi.fn(), gain: { setValueAtTime: vi.fn() } }
  }
  createBufferSource() {
    return { connect: vi.fn(), start: vi.fn(), stop: vi.fn() }
  }
  decodeAudioData() {
    return Promise.resolve({})
  }
}

global.AudioContext = MockAudioContext as any
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
  })
) as any

describe('useAudio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with null currentSound', () => {
    const { currentSound } = useAudio()
    expect(currentSound.value).toBeNull()
  })

  it('should change volume', () => {
    const { setVolume, volume } = useAudio()
    setVolume(0.5)
    expect(volume.value).toBe(0.5)
  })

  it('should play and stop sound', async () => {
    const { playSound, stopSound, currentSound } = useAudio()
    await playSound('rain-1')
    expect(currentSound.value).toBe('rain-1')
    stopSound()
    expect(currentSound.value).toBeNull()
  })
})
