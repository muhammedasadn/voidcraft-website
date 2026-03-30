// ─── Navigation ──────────────────────────────────────────────────────────────

import { bus } from '@/utils/events'
import { qs, qsAll } from '@/utils/dom'
import type { SmoothScroll } from '@/core/SmoothScroll'
import type { ScrollPayload } from '@/types'

export class Navigation {
  private readonly _nav:  HTMLElement
  private readonly _menu: HTMLElement
  private readonly _hint: HTMLElement
  private readonly _prog: HTMLElement

  constructor(private readonly _scr: SmoothScroll) {
    this._nav  = qs<HTMLElement>('#NV')
    this._menu = qs<HTMLElement>('#MN')
    this._hint = qs<HTMLElement>('#sh')
    this._prog = qs<HTMLElement>('#pb')

    const hbg  = qs<HTMLButtonElement>('#hbg')
    const mcls = qs<HTMLButtonElement>('#mcls')

    hbg.addEventListener('click',  () => this._open())
    mcls.addEventListener('click', () => this._close())
    document.addEventListener('keydown', e => { if (e.key === 'Escape') this._close() })

    // Menu nav links
    qsAll<HTMLAnchorElement>('#MN a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault()
        this._close()
        const id = a.getAttribute('href')!.slice(1)
        setTimeout(() => {
          const el = document.getElementById(id)
          if (el) this._scr.scrollTo(el)
        }, 200)
      })
    })

    // All anchor links outside menu
    qsAll<HTMLAnchorElement>('a[href^="#"]').forEach(a => {
      if (a.closest('#MN')) return
      a.addEventListener('click', e => {
        const id = a.getAttribute('href')!.slice(1)
        const el = document.getElementById(id)
        if (el) { e.preventDefault(); this._scr.scrollTo(el) }
      })
    })

    bus.on<ScrollPayload>('scroll', ({ y, p }) => {
      this._prog.style.width = `${p * 100}%`
      y > 80
        ? (this._nav.classList.add('bg'),   this._hint.classList.add('off'))
        : (this._nav.classList.remove('bg'), this._hint.classList.remove('off'))
    })
  }

  private _open():  void { this._menu.classList.add('on') }
  private _close(): void { this._menu.classList.remove('on') }
}
