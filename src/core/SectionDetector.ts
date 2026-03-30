// ─── Section Detector ────────────────────────────────────────────────────────
// Works with virtual (lerp) scroll — checks element.offsetTop in content space

import { bus } from '@/utils/events'
import type { SectionId } from '@/types'

const SECTION_IDS: SectionId[] = [
  'hero', 'work', 'about', 'stats', 'services', 'awards', 'journal', 'footer',
]

let _active: SectionId = 'hero'

export function detectSection(scrollY: number): void {
  const vh = window.innerHeight
  let current: SectionId = 'hero'

  for (const id of SECTION_IDS) {
    const el = document.getElementById(id)
    if (el && scrollY + vh * 0.6 >= el.offsetTop) current = id
  }

  if (current !== _active) {
    _active = current
    bus.emit<SectionId>('sec', current)
  }
}

export function getActiveSection(): SectionId {
  return _active
}
