// ─── Hero Text Animation ─────────────────────────────────────────────────────
// Splits eyebrow into per-character spans for staggered reveal.
// Big display lines use CSS clip + translateY.

import { qs, qsAll } from '@/utils/dom'

export class HeroText {
  /** Call once after preloader finishes */
  animate(): void {
    // Slide lines up
    setTimeout(() => qs<HTMLElement>('#hl0').classList.add('show'), 60)
    setTimeout(() => qs<HTMLElement>('#hl1').classList.add('show'), 210)

    // Per-char eyebrow
    const eye = document.getElementById('heye')
    if (!eye) return

    const text = eye.textContent ?? ''
    eye.innerHTML = ''
    let idx = 0

    text.split(' ').forEach((word, wi, arr) => {
      const ws = document.createElement('span')
      ws.style.cssText = 'display:inline-block;overflow:hidden'

      for (const ch of word) {
        const s = document.createElement('span')
        s.className = 'sc-char'
        s.textContent = ch
        s.style.transitionDelay = `${500 + idx * 15}ms`
        idx++
        ws.append(s)
      }

      eye.append(ws)
      if (wi < arr.length - 1) eye.append(document.createTextNode('\u00a0'))
    })

    // Trigger after one paint
    requestAnimationFrame(() => {
      qsAll<HTMLElement>('.sc-char').forEach(s => {
        s.style.transform = 'none'
        s.style.opacity   = '1'
      })
    })
  }
}
