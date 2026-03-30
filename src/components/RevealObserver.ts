// ─── Reveal on Scroll ────────────────────────────────────────────────────────
// Uses virtual scroll y (from SmoothScroll.tick) to check .rv elements.
// IntersectionObserver can't see through translateY, so we check offsetTop.

import type { SmoothScroll } from '@/core/SmoothScroll'
import { qsAll } from '@/utils/dom'

export class RevealObserver {
  private readonly _els: HTMLElement[]

  constructor(private readonly _scr: SmoothScroll) {
    this._els = qsAll<HTMLElement>('.rv')
  }

  /** Called every frame from the main loop */
  check(): void {
    const y  = this._scr.y
    const vh = window.innerHeight

    for (const el of this._els) {
      if (!el.classList.contains('show') && y + vh * 0.88 >= el.offsetTop) {
        el.classList.add('show')
      }
    }
  }
}
