// ─── Shared Types ────────────────────────────────────────────────────────────

export interface Vec2 {
  x: number
  y: number
}

export type SectionId =
  | 'hero'
  | 'work'
  | 'about'
  | 'stats'
  | 'services'
  | 'awards'
  | 'journal'
  | 'footer'

export interface ScrollPayload {
  y: number
  p: number // 0–1 progress
}

export interface OrbTarget {
  x: number
  y: number
  s: number // scale
}

export type BusEvents = {
  scroll: ScrollPayload
  sec: SectionId
  slide: number
  ptick: number
  ready: undefined
}
