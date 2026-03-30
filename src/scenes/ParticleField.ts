// ─── Particle Field ──────────────────────────────────────────────────────────

import * as THREE from 'three'
import { lerp } from '@/utils/math'
import { bus } from '@/utils/events'
import { PARTICLE_VERT, PARTICLE_FRAG } from './shaders'

const COUNT = 400

export class ParticleField {
  private readonly _mat: THREE.ShaderMaterial
  private _scrollY = 0
  private _targetY = 0

  constructor(scene: THREE.Scene) {
    const pos = new Float32Array(COUNT * 3)
    const sz  = new Float32Array(COUNT)
    const spd = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 14
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5
      sz[i]  = 0.4  + Math.random() * 1.05
      spd[i] = 0.3  + Math.random() * 0.7
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('aS',       new THREE.BufferAttribute(sz,  1))
    geo.setAttribute('aSp',      new THREE.BufferAttribute(spd, 1))

    this._mat = new THREE.ShaderMaterial({
      vertexShader:   PARTICLE_VERT,
      fragmentShader: PARTICLE_FRAG,
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
      uniforms: {
        uT: { value: 0 },
        uY: { value: 0 },
      },
    })

    scene.add(new THREE.Points(geo, this._mat))

    bus.on<{ y: number }>('scroll', ({ y }) => { this._targetY = y })
  }

  update(time: number): void {
    this._scrollY = lerp(this._scrollY, this._targetY, 0.045)
    this._mat.uniforms['uT'].value = time
    this._mat.uniforms['uY'].value = this._scrollY
  }

  dispose(): void {
    this._mat.dispose()
  }
}
