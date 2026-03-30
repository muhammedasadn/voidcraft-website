// ─── Orb Scene ───────────────────────────────────────────────────────────────

import * as THREE from 'three'
import { lerp } from '@/utils/math'
import { bus } from '@/utils/events'
import { ORB_VERT, ORB_FRAG } from './shaders'
import type { SectionId, OrbTarget } from '@/types'

const TARGETS: Record<SectionId, OrbTarget> = {
  hero:     { x:  1.3,  y:  0.0,  s: 2.7 },
  work:     { x: -0.5,  y: -0.28, s: 2.5 },
  about:    { x:  1.5,  y:  0.1,  s: 2.4 },
  stats:    { x:  0.0,  y:  0.2,  s: 2.2 },
  services: { x:  0.0,  y:  0.15, s: 2.1 },
  awards:   { x:  1.3,  y:  0.2,  s: 2.3 },
  journal:  { x: -0.9,  y: -0.1,  s: 2.2 },
  footer:   { x:  1.3,  y:  0.35, s: 2.55 },
}

const SLIDE_IMAGES: Record<number, string> = {
  0: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=700&q=75',
  1: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=75',
  2: 'https://images.unsplash.com/photo-1536240478700-b869ad10a2eb?w=700&q=75',
}
const JOURNAL_IMG = 'https://images.unsplash.com/photo-1487611459768-bd414656ea10?w=700&q=75'

export class OrbScene {
  private readonly _mesh: THREE.Mesh
  private readonly _mat:  THREE.ShaderMaterial
  private readonly _ldr = new THREE.TextureLoader()

  // Lerp state
  private _ox = 1.3; _oy = 0; _os = 2.7
  private _cx = 1.3; _cy = 0; _cs = 2.7
  private _tI = 0;   _cI = 0
  private _slide = 0

  constructor(readonly scene: THREE.Scene) {
    const blank = new THREE.DataTexture(new Uint8Array([14, 8, 22, 255]), 1, 1)
    blank.needsUpdate = true

    this._mat = new THREE.ShaderMaterial({
      vertexShader: ORB_VERT,
      fragmentShader: ORB_FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uT:   { value: 0 },
        uM:   { value: 0.19 },
        uI:   { value: 0 },
        uTex: { value: blank },
      },
    })

    // 64 segments: half the triangle count of 128, visually identical at this scale
    this._mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), this._mat)
    this._mesh.position.set(1.3, 0, 0)
    this._mesh.scale.setScalar(2.7)
    scene.add(this._mesh)

    bus.on<SectionId>('sec', s => this._onSection(s))
    bus.on<number>('slide', i => {
      this._slide = i
      if (this._getActiveSection() === 'work') {
        this._loadTex(SLIDE_IMAGES[i] ?? SLIDE_IMAGES[0])
        this._tI = 1
      }
    })
  }

  private _getActiveSection(): string {
    // Read from SectionDetector singleton
    return document.documentElement.dataset['sec'] ?? 'hero'
  }

  private _onSection(sec: SectionId): void {
    document.documentElement.dataset['sec'] = sec
    const t = TARGETS[sec]
    this._ox = t.x; this._oy = t.y; this._os = t.s

    if (sec === 'work') {
      this._loadTex(SLIDE_IMAGES[this._slide] ?? SLIDE_IMAGES[0])
      this._tI = 1
    } else if (sec === 'journal') {
      this._loadTex(JOURNAL_IMG)
      this._tI = 1
    } else {
      this._tI = 0
    }
  }

  private _loadTex(url: string): void {
    this._ldr.load(url, tx => {
      tx.colorSpace = THREE.SRGBColorSpace
      this._mat.uniforms['uTex'].value = tx
    })
  }

  update(time: number): void {
    const e = 0.03
    this._cx = lerp(this._cx, this._ox, e)
    this._cy = lerp(this._cy, this._oy, e)
    this._cs = lerp(this._cs, this._os, e)
    this._cI = lerp(this._cI, this._tI, 0.036)

    this._mesh.position.set(this._cx, this._cy, 0)
    this._mesh.scale.setScalar(this._cs)
    this._mesh.rotation.y = time * 0.065
    this._mesh.rotation.x = Math.sin(time * 0.038) * 0.038

    this._mat.uniforms['uT'].value = time
    this._mat.uniforms['uI'].value = this._cI
    this._mat.uniforms['uM'].value = 0.16 + Math.sin(time * 0.38) * 0.038 + Math.sin(time * 0.65) * 0.018
  }

  dispose(): void {
    this._mat.dispose()
    this.scene.remove(this._mesh)
  }
}
