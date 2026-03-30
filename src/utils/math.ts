// ─── Math Utilities ──────────────────────────────────────────────────────────

export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t

export const clamp = (v: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, v))

export const mapRange = (
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number => lerp(outMin, outMax, clamp((v - inMin) / (inMax - inMin), 0, 1))

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)
