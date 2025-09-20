// Fix: Placeholder content that caused errors has been replaced with audio playback logic using the Web Audio API.
// This avoids needing external audio files.

let audioCtx: AudioContext | null = null;
const getAudioContext = (): AudioContext | null => {
  if (audioCtx) return audioCtx;
  if (typeof window !== 'undefined') {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API is not supported in this browser");
      return null;
    }
  }
  return audioCtx;
};

const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  const gainNode = ctx.createGain();
  const volume = 0.1;
  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration / 1000);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + duration / 1000);
};

// Play a short, higher-pitched sound for a correct keystroke.
export const playKeystrokeSound = () => {
  playTone(880, 50, 'triangle');
};

// Play a longer, lower-pitched sound for an incorrect keystroke.
export const playErrorSound = () => {
  playTone(220, 150, 'square');
};
