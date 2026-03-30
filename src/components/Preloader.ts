// ─── Preloader ───────────────────────────────────────────────────────────────

import { bus } from '@/utils/events'
import { qs } from '@/utils/dom'

export class Preloader {
  private readonly _el:   HTMLElement
  private readonly _cnt:  HTMLElement
  private readonly _fill: HTMLElement
  private _n    = 0
  private _tgt  = 0
  private _done = false

  constructor() {
    this._el   = qs<HTMLElement>('#PL')
    this._cnt  = qs<HTMLElement>('#pn')
    this._fill = qs<HTMLElement>('#pf')

    // Staggered fake progress milestones
    const steps = [
      { d: 0,    t: 12 },
      { d: 140,  t: 36 },
      { d: 380,  t: 62 },
      { d: 720,  t: 86 },
      { d: 1050, t: 100 },
    ]
    steps.forEach(({ d, t }) => setTimeout(() => { this._tgt = t }, d))
    this._tick()
  }

  private _tick = (): void => {
    if (this._n < this._tgt) {
      this._n = Math.min(this._n + 1.7, this._tgt)
      const i = Math.floor(this._n)
      this._cnt.textContent = String(i)
      this._fill.style.width = `${i}%`
      this._cnt.style.color = `rgba(255,255,255,${(i / 100) * 0.85})`
    }

    if (this._n >= 100 && !this._done) {
      this._done = true
      setTimeout(() => {
        this._el.classList.add('out')
        bus.emit('ready')
        setTimeout(() => this._el.remove(), 950)
      }, 150)
      return
    }

    requestAnimationFrame(this._tick)
  }
}
