export function createRainbow(steps: number = 64): RGB[] {
  // given step of 30,
  // red   - rising: 20-35, plateau: 25-30,0-5, decay: 5-10
  // green - rising: 0-5,   plateau: 5-15,      decay: 15-20
  // blue  - rising  10-15  plateau: 15-25,     decay: 25-30

  return Array(steps)
    .fill(null)
    .map((_, i) => (i / steps) * 3)
    .map((x) => {
      const r = x > 1 ? grad(x - 2) : grad(x + 1);
      const g = grad(x);
      const b = grad(x - 1);
      return [r, g, b];
    });
}

/**
 *         ____________
 * 1     /              \
 *     /                  \
 * 0 /                      \____________
 *   0    0.5   1     1.5    2           3
 */
function grad(x: number) {
  if (x < 0) {
    return 0;
  } else if (x < 0.5) {
    return x * 2;
  } else if (x < 1.5) {
    return 1;
  } else if (x < 2) {
    return (2 - x) * 2;
  } else {
    return 0;
  }
}

// numbers are [0, 1]
export type RGB = [number, number, number];

export function addColors(a: RGB, b: RGB): RGB {
  return a.map((a, i) => Math.max(0, Math.min(1, a + b[i]))) as RGB;
}
