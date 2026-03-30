// ─── Marquee — Infinite Horizontal Ticker ────────────────────────────────────

export interface MarqueeOptions {
  text:      string
  speed?:    number   // px per second  (default 50)
  reversed?: boolean
}

const DIAMOND_SVG = `<svg viewBox="0 0 10 10" fill="currentColor" style="width:8px;height:8px;color:#e63329;flex-shrink:0"><polygon points="5,0 10,5 5,10 0,5"/></svg>`

export class Marquee {
  private readonly _wrap:  HTMLElement
  private readonly _inner: HTMLElement
  private _x   = 0
  private _w   = 0
  private readonly _dir:   number
  private readonly _speed: number

  constructor(container: HTMLElement, opts: MarqueeOptions) {
    this._speed = opts.speed ?? 50
    this._dir   = opts.reversed ? 1 : -1

    this._wrap  = document.createElement('div')
    this._inner = document.createElement('div')
    this._wrap.className  = 'mw'
    this._inner.className = 'mi'

    const chunk = `${opts.text}&nbsp;&nbsp;${DIAMOND_SVG}&nbsp;&nbsp;`
    this._inner.innerHTML = Array(10).fill(`<span class="mt">${chunk}</span>`).join('')
    this._wrap.append(this._inner)
    container.append(this._wrap)

    requestAnimationFrame(() => {
      this._w = (this._inner.firstElementChild as HTMLElement)?.offsetWidth ?? 200
      this._run()
    })
  }

  private _run = (): void => {
    this._x += this._dir * (this._speed / 60)
    if (this._dir < 0 && this._x < -this._w) this._x += this._w
    else if (this._dir > 0 && this._x > 0)   this._x -= this._w
    this._inner.style.transform = `translateX(${this._x}px)`
    requestAnimationFrame(this._run)
  }
}
