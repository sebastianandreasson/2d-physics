import * as THREE from 'three'
import { SIZE, types, colors } from '../utils/constants'
import { getId } from '../utils/globals'

const standardGeometry = new THREE.PlaneBufferGeometry(SIZE, SIZE)

export default class Element {
  constructor(x, y, color, scale = 1, transparent) {
    this.id = getId()
    const size = SIZE * scale
    this.object = new THREE.Object3D()
    let geometry
    if (scale === 1) {
      geometry = standardGeometry.clone()
    } else {
      geometry = new THREE.PlaneBufferGeometry(size, size)
    }
    new THREE.PointsMaterial({ size: SIZE, sizeAttenuation: false })
    const material = new THREE.MeshBasicMaterial({
      color,
      side: THREE.BackSide,
    })
    material.transparent = transparent
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.castShadow = false
    this.mesh.position.set(size / 2, size / 2, 0)
    this.object.add(this.mesh)
    this.object.position.set(x, y, 0)
    this.size = scale

    this.particle = false
  }

  get data() {
    return {
      id: this.id,
      x: this.object.position.x,
      y: this.object.position.y,
      rotation: this.object.rotation.x,
      type: this.type,
      direction: this.direction,
      force: this.force,
      particle: this.particle,
      size: this.size,
    }
  }

  makeParticle(force = 2) {
    this.particle = true
    this.setColor(colors.WHITE)
    this.direction = Math.random() > 0.5 ? 1 : -1
    this.force = force + Math.floor(Math.random() * force)
  }

  setColor(color, opacity = 1) {
    this.mesh.material.color.set(color)
    this.object.renderOrder = 1
    this.mesh.material.opacity = opacity
  }
}
