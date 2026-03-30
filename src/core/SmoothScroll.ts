// ─── Smooth Scroll ───────────────────────────────────────────────────────────
// body overflow:hidden — #SC moves via translateY driven by a lerp RAF loop.
// No native scroll repaint, no jank.

import { lerp, clamp } from '@/utils/math'
import { bus } from '@/utils/events'
import { qs } from '@/utils/dom'

export class SmoothScroll {
  y = 0
  t = 0
  v = 0
  max = 0
  readonly ease: number

  private readonly _c: HTMLElement  // #SC content div
  private readonly _h: HTMLElement  // #SH height sentinel

  constructor(ease = 0.09) {
    this.ease = ease
    this._c = qs<HTMLElement>('#SC')
    this._h = qs<HTMLElement>('#SH')
    this._resize()

    window.addEventListener('resize', () => this._resize(), { passive: true })

    window.addEventListener('wheel', e => {
      e.preventDefault()
      this.t = clamp(this.t + e.deltaY, 0, this.max)
    }, { passive: false })

    let t0 = 0
    window.addEventListener('touchstart', e => { t0 = e.touches[0].clientY }, { passive: true })
    window.addEventListener('touchmove', e => {
      e.preventDefault()
      const d = t0 - e.touches[0].clientY
      t0 = e.touches[0].clientY
      this.t = clamp(this.t + d * 1.6, 0, this.max)
    }, { passive: false })

    window.addEventListener('keydown', e => {
      const map: Record<string, number> = {
        ArrowDown: 90, ArrowUp: -90,
        PageDown: window.innerHeight * 0.8,
        PageUp: -window.innerHeight * 0.8,
      }
      if (map[e.key] != null) {
        e.preventDefault()
        this.t = clamp(this.t + map[e.key], 0, this.max)
      }
      if (e.key === 'Home') this.t = 0
      if (e.key === 'End')  this.t = this.max
    })
  }

  private _resize(): void {
    this._c.style.transform = 'none'
    this.max = Math.max(0, this._c.offsetHeight - window.innerHeight)
    this._h.style.height = this._c.offsetHeight + 'px'
    this._c.style.transform = `translateY(${-this.y}px)`
  }

  scrollTo(el: HTMLElement): void {
    this.t = clamp(el.offsetTop, 0, this.max)
  }

  tick(): void {
    this.v = lerp(this.v, this.t - this.y, this.ease)
    if (Math.abs(this.t - this.y) < 0.04) { this.y = this.t; this.v = 0 }
    else this.y += this.v
    this.y = clamp(this.y, 0, this.max)
    this._c.style.transform = `translateY(${-this.y}px)`
    bus.emit<{ y: number; p: number }>('scroll', {
      y: this.y,
      p: this.max > 0 ? this.y / this.max : 0,
    })
  }
}
