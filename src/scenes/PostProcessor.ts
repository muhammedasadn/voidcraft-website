// ─── Post Processor ──────────────────────────────────────────────────────────
// Renders scene to offscreen RT, then applies grain + vignette quad pass.

import * as THREE from 'three'
import { QUAD_VERT, QUAD_FRAG } from './shaders'

export class PostProcessor {
  private readonly _rt:  THREE.WebGLRenderTarget
  private readonly _mat: THREE.ShaderMaterial
  private readonly _qs:  THREE.Scene
  private readonly _qc:  THREE.OrthographicCamera

  constructor(
    private readonly _r: THREE.WebGLRenderer,
    private readonly _s: THREE.Scene,
    private readonly _c: THREE.Camera,
  ) {
    const w = window.innerWidth, h = window.innerHeight

    this._rt = new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      type:      THREE.HalfFloatType,
    })

    this._mat = new THREE.ShaderMaterial({
      vertexShader:   QUAD_VERT,
      fragmentShader: QUAD_FRAG,
      depthWrite: false,
      uniforms: {
        uS: { value: this._rt.texture },
        uT: { value: 0 },
      },
    })

    this._qs = new THREE.Scene()
    this._qs.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this._mat))
    this._qc = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    window.addEventListener('resize', this._onResize, { passive: true })
  }

  render(time: number): void {
    this._r.setRenderTarget(this._rt)
    this._r.render(this._s, this._c)
    this._r.setRenderTarget(null)
    this._mat.uniforms['uT'].value = time
    this._r.render(this._qs, this._qc)
  }

  private _onResize = (): void => {
    this._rt.setSize(window.innerWidth, window.innerHeight)
  }

  dispose(): void {
    window.removeEventListener('resize', this._onResize)
    this._rt.dispose()
    this._mat.dispose()
  }
}
