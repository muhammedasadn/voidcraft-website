// ─── VOIDCRAFT® — Application Entry Point ────────────────────────────────────
import '@/styles/main.css'

// Core
import { SmoothScroll }     from '@/core/SmoothScroll'
import { Renderer }         from '@/core/Renderer'
import { CursorManager }    from '@/core/CursorManager'
import { detectSection }    from '@/core/SectionDetector'

// Scenes
import { OrbScene }         from '@/scenes/OrbScene'
import { ParticleField }    from '@/scenes/ParticleField'
import { PostProcessor }    from '@/scenes/PostProcessor'

// Components
import { Preloader }        from '@/components/Preloader'
import { Navigation }       from '@/components/Navigation'
import { WorkSlider }       from '@/components/WorkSlider'
import { Marquee }          from '@/components/Marquee'
import { RevealObserver }   from '@/components/RevealObserver'
import { HeroText }         from '@/components/HeroText'

// Utils
import { bus }              from '@/utils/events'
import type { ScrollPayload } from '@/types'

class App {
  private readonly _scr:    SmoothScroll
  private readonly _rnd:    Renderer
  private readonly _orb:    OrbScene
  private readonly _ptcl:   ParticleField
  private readonly _post:   PostProcessor
  private readonly _reveal: RevealObserver
  private readonly _slider: WorkSlider
  private readonly _hero:   HeroText

  constructor() {
    // 1. Preloader starts immediately (DOM already exists)
    new Preloader()

    // 2. Smooth virtual scroll
    this._scr = new SmoothScroll(0.09)

    // 3. Custom cursor (runs its own RAF)
    new CursorManager()

    // 4. Three.js renderer + scenes
    this._rnd  = new Renderer()
    this._orb  = new OrbScene(this._rnd.scene)
    this._ptcl = new ParticleField(this._rnd.scene)
    this._post = new PostProcessor(
      this._rnd.renderer,
      this._rnd.scene,
      this._rnd.camera,
    )

    // 5. DOM components
    new Navigation(this._scr)
    this._slider = new WorkSlider()
    this._reveal = new RevealObserver(this._scr)
    this._hero   = new HeroText()

    // 6. Marquee tickers
    this._buildMarquees()

    // 7. Connect render loop
    this._rnd.setUpdateCallback((time: number) => {
      this._scr.tick()
      this._reveal.check()
      this._orb.update(time)
      this._ptcl.update(time)
      this._post.render(time)
    })

    // 8. Start everything after preloader signals done
    bus.on('ready', () => {
      this._rnd.start()
      this._hero.animate()
    })

    // 9. Wire section detection into scroll updates
    bus.on<ScrollPayload>('scroll', ({ y }) => detectSection(y))
  }

  private _buildMarquees(): void {
    const configs: Array<{ id: string; text: string; reversed?: boolean }> = [
      {
        id:   'mq1',
        text: 'Web Design — Brand Strategy — Motion Design — Digital Craft',
      },
      {
        id:       'mq2',
        text:     'VOIDCRAFT® — Build Bolder — Independent Studio — Kollam IN',
        reversed: true,
      },
    ]

    for (const { id, text, reversed } of configs) {
      const el = document.getElementById(id)
      if (el) new Marquee(el, { text, speed: 50, reversed })
    }
  }

  destroy(): void {
    this._orb.dispose()
    this._ptcl.dispose()
    this._post.dispose()
    this._rnd.dispose()
    this._slider.destroy()
  }
}

// Bootstrap
const app = new App()

// Vite HMR
if (import.meta.hot) {
  import.meta.hot!.dispose(() => app.destroy())
}
