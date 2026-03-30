// ─── Work Slider ─────────────────────────────────────────────────────────────

import { bus } from '@/utils/events'
import { qs, qsAll } from '@/utils/dom'

const INTERVAL_MS = 3600

export class WorkSlider {
  private readonly _slides: HTMLElement[]
  private readonly _dots:   HTMLButtonElement[]
  private readonly _num:    HTMLElement
  private _cur   = 0
  private _timer = 0

  constructor() {
    this._slides = qsAll<HTMLElement>('.slide')
    this._dots   = qsAll<HTMLButtonElement>('.dot')
    this._num    = qs<HTMLElement>('#snum')

    this._dots.forEach((d, i) => {
      d.addEventListener('click', () => {
        clearInterval(this._timer)
        this._go(i)
        this._startTimer()
      })
    })

    this._startTimer()
  }

  private _go(i: number): void {
    this._slides[this._cur].classList.remove('on')
    this._dots[this._cur].classList.remove('on')
    this._cur = i
    this._slides[i].classList.add('on')
    this._dots[i].classList.add('on')
    this._num.textContent = String(i + 1).padStart(2, '0')
    bus.emit<number>('slide', i)
  }

  private _startTimer(): void {
    this._timer = window.setInterval(
      () => this._go((this._cur + 1) % this._slides.length),
      INTERVAL_MS,
    )
  }

  destroy(): void {
    clearInterval(this._timer)
  }
}
