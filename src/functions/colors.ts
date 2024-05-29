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

/** @param position - a number between 0 and 1
 */
export function sampleRainbow(
  position: number,
  length: number,
  totalLength: number
) {
  return createRainbow(totalLength).slice(position, position + length);
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

export function isColorEqual(a: RGB, b: RGB): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

export function addColors(a: RGB, b: RGB): RGB {
  return a.map((a, i) => Math.max(0, Math.min(1, a + b[i]))) as RGB;
}

export function muteColor(color: RGB, factor: number): RGB {
  return color.map((c) => Math.min(1, Math.max(0, c * factor))) as RGB;
}

export function invert(color: RGB): RGB {
  const avg = color.reduce((a, b) => a + b, 0) / 3;
  const error = color.map((x) => x - avg);
  return [
    avg + (error[1] + error[2]) / 2,
    avg + (error[0] + error[2]) / 2,
    avg + (error[0] + error[1]) / 2,
  ];
}

export function brighten(
  color: RGB,
  {
    factor = 1.25,
    minWhite = 0.25,
  }: { factor?: number; minWhite?: number } = {}
): RGB {
  return muteColor(color.map((x) => Math.max(x, minWhite)) as RGB, factor);
}
