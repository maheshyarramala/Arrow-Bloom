/**
 * Arrow Bloom - Confetti & Celebration Effects
 */
import confetti from 'canvas-confetti';

export function fireLevelWinConfetti() {
  try {
    // Left burst
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#FF4D8D', '#FFD93D', '#2EE6A8', '#22D3EE', '#B05CFF', '#FF8A3D'],
    });
    // Right burst
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#FF4D8D', '#FFD93D', '#2EE6A8', '#22D3EE', '#B05CFF', '#FF8A3D'],
    });
  } catch {
    // Ignore canvas-confetti issues
  }
}

export function fireGrandFinaleConfetti() {
  try {
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#FF4D8D', '#FFD93D', '#2EE6A8', '#22D3EE', '#B05CFF', '#FF8A3D', '#E83CF0', '#7CE23A'];

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.65 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.65 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  } catch {
    // Ignore
  }
}
