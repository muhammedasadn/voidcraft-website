// ─── Three.js Renderer ───────────────────────────────────────────────────────

import * as THREE from 'three'
import { qs } from '@/utils/dom'

export class Renderer {
  readonly renderer: THREE.WebGLRenderer
  readonly scene:    THREE.Scene
  readonly camera:   THREE.PerspectiveCamera

  // Post-processor owns the render call when true
  skipDefaultRender = true

  private _running  = false
  private _rafId    = 0
  private _clock    = new THREE.Clock()
  private _onUpdate?: (time: number, delta: number) => void

  constructor() {
    const canvas = qs<HTMLCanvasElement>('#oc')

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.1
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    this.scene  = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 80)
    this.camera.position.z = 5

    window.addEventListener('resize', this._onResize, { passive: true })
  }

  setUpdateCallback(fn: (t: number, dt: number) => void): void {
    this._onUpdate = fn
  }

  start(): void {
    if (this._running) return
    this._running = true
    this._clock.start()
    this._tick()
  }

  private _tick = (): void => {
    if (!this._running) return
    const delta = this._clock.getDelta()
    const time  = this._clock.getElapsedTime()
    this._onUpdate?.(time, delta)
    if (!this.skipDefaultRender) this.renderer.render(this.scene, this.camera)
    this._rafId = requestAnimationFrame(this._tick)
  }

  private _onResize = (): void => {
    const w = window.innerWidth, h = window.innerHeight
    this.renderer.setSize(w, h)
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  dispose(): void {
    this._running = false
    cancelAnimationFrame(this._rafId)
    window.removeEventListener('resize', this._onResize)
    this.renderer.dispose()
  }
}
