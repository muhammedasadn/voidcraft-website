# VOIDCRAFT® — Independent Creative Studio

A high-fidelity creative agency website built with **TypeScript**, **Three.js r169**, and **Vite 5**.

---

## Quick Start

```bash
npm install
npm run dev        # → http://localhost:3000
npm run build      # production build → dist/
npm run preview    # preview production build
npm run type-check # TypeScript strict check (no emit)
```

---

## Project Structure

```
voidcraft/
├── index.html                      ← Semantic HTML entry (all sections)
├── package.json
├── tsconfig.json                   ← Strict TS, path aliases @/*
├── vite.config.ts                  ← Chunked build (three isolated)
│
├── public/
│   ├── favicon.svg                 ← SVG favicon
│   └── assets/                     ← Static images / fonts
│
└── src/
    ├── main.ts                     ← App class — bootstraps all systems
    │
    ├── styles/
    │   └── main.css                ← Full design system (tokens → responsive)
    │
    ├── types/
    │   └── index.ts                ← Vec2, SectionId, OrbTarget, BusEvents
    │
    ├── utils/
    │   ├── math.ts                 ← lerp, clamp, mapRange, easeOutCubic
    │   ├── dom.ts                  ← qs<T>(), qsAll<T>() typed helpers
    │   └── events.ts               ← Typed EventEmitter + global bus singleton
    │
    ├── core/
    │   ├── SmoothScroll.ts         ← Lerp virtual scroll (body overflow:hidden)
    │   ├── Renderer.ts             ← WebGLRenderer wrapper + RAF loop
    │   ├── CursorManager.ts        ← Lerp-smoothed custom cursor
    │   └── SectionDetector.ts      ← Content-space section ID detection
    │
    ├── scenes/
    │   ├── shaders.ts              ← All GLSL (ORB_VERT/FRAG, QUAD, PARTICLES)
    │   ├── OrbScene.ts             ← Iridescent morphing Three.js sphere
    │   ├── ParticleField.ts        ← 400 ambient GLSL point sprites
    │   └── PostProcessor.ts        ← Film grain + vignette offscreen RT pass
    │
    └── components/
        ├── Preloader.ts            ← Animated 0→100 count-up loader
        ├── Navigation.ts           ← Nav + menu overlay, scroll-aware header
        ├── WorkSlider.ts           ← Auto-advancing work slide controller
        ├── Marquee.ts              ← Infinite horizontal text ticker
        ├── RevealObserver.ts       ← Virtual-scroll-aware .rv reveal checker
        └── HeroText.ts             ← Per-char eyebrow split + line reveals
```

---

## Architecture

### Render Pipeline
```
App constructor
  └─ Renderer.start()
       └─ RAF tick
            ├─ SmoothScroll.tick()       → translate #SC, emit scroll event
            ├─ RevealObserver.check()    → .rv → .rv.show
            ├─ OrbScene.update(t)        → lerp position/scale, update uniforms
            ├─ ParticleField.update(t)   → scroll-driven drift uniform
            └─ PostProcessor.render(t)
                 ├─ renderer → offscreen RenderTarget
                 └─ grain+vignette quad → screen
```

### Smooth Scroll
`body { overflow: hidden }` — the browser never scrolls. `#SC` moves via `transform: translateY(-Npx)` driven purely by a lerp loop. Supports wheel, touch, and keyboard (arrows, Page, Home/End).

### Event Bus
All cross-module communication goes through the typed `bus` singleton:
- `scroll` → `{ y, p }` — emitted every frame from SmoothScroll
- `sec` → `SectionId` — emitted when active section changes
- `slide` → `number` — emitted by WorkSlider on change
- `ready` → `undefined` — emitted by Preloader when done
- `ptick` → `number` (time) — particle tick

### GLSL Shaders (`src/scenes/shaders.ts`)
All four shaders live in one file with `/* glsl */` template literal tags:
- **ORB_VERT** — FBM noise vertex displacement (organic morph)
- **ORB_FRAG** — Cosine-palette iridescence + Fresnel rim + texture mix
- **PARTICLE_VERT/FRAG** — Scroll-offset drift with soft sprite alpha
- **QUAD_VERT/FRAG** — Film grain + radial vignette post pass

---

## Customisation

### Brand Color
```css
/* src/styles/main.css */
:root { --r: #e63329; }  /* ← change this */
```

### Orb Section Positions
```ts
// src/scenes/OrbScene.ts
const TARGETS: Record<SectionId, OrbTarget> = {
  hero:  { x: 1.3, y: 0.0, s: 2.7 },
  work:  { x: -0.5, y: -0.28, s: 2.5 },
  // ...
}
```

### Work Slides
Edit `.slide` divs in `index.html` and update `SLIDE_IMAGES` in `OrbScene.ts`.

### Smooth Scroll Easing
```ts
// src/main.ts
this._scr = new SmoothScroll(0.09)  // 0.05 = more friction, 0.2 = snappier
```

---

## Browser Support
WebGL 2 required. Works in Chrome 90+, Firefox 88+, Safari 15+.
Canvas is pointer-events:none — mobile gets native scroll fallback.
