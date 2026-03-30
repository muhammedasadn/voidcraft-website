// ─── Custom Cursor ───────────────────────────────────────────────────────────

import { lerp } from '@/utils/math'
import { qs, qsAll } from '@/utils/dom'

export class CursorManager {
  private readonly _dot:  HTMLElement
  private readonly _ring: HTMLElement
  private _mx = 0; _my = 0
  private _rx = 0; _ry = 0

  constructor() {
    this._dot  = qs<HTMLElement>('#cd')
    this._ring = qs<HTMLElement>('#cr')

    document.addEventListener('mousemove', e => {
      this._mx = e.clientX; this._my = e.clientY
      this._dot.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`
      this._dot.classList.add('v')
      this._ring.classList.add('v')
    })
    document.addEventListener('mouseleave', () => {
      this._dot.classList.remove('v')
      this._ring.classList.remove('v')
    })

    qsAll<HTMLElement>('a,button,.dot,.svc,.aw-item').forEach(el => {
      el.addEventListener('mouseenter', () => this._ring.classList.add('b'))
      el.addEventListener('mouseleave', () => this._ring.classList.remove('b'))
    })

    this._animate()
  }

  private _animate = (): void => {
    this._rx = lerp(this._rx, this._mx, 0.1)
    this._ry = lerp(this._ry, this._my, 0.1)
    this._ring.style.transform = `translate(${this._rx}px,${this._ry}px) translate(-50%,-50%)`
    requestAnimationFrame(this._animate)
  }
}
