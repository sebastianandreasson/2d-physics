import * as THREE from 'three'
import { SIZE, types, colors } from '../utils/constants'

export default class Element {
  constructor(x, y, color, scale = 1) {
    const size = SIZE * scale
    this.object = new THREE.Object3D()
    this.geometry = new THREE.PlaneBufferGeometry(size, size)
    this.material = new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide,
    })
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.castShadow = false
    this.mesh.position.set(size / 2, size / 2, 0)
    this.object.add(this.mesh)
    this.object.position.set(x, y, 0)

    this.particle = false
  }

  makeParticle(force = 2) {
    this.particle = true
    this.setColor(colors.WHITE)
    this.direction = Math.random() > 0.5 ? 1 : -1
    this.force = force + Math.floor(Math.random() * force)
  }

  particleSimulation(world) {
    let { x, y } = this.worldPos

    if (!this.force) {
      this.setColor(colors.BLUE)
      this.particle = false
    } else {
      this.setColor(colors.WHITE, 1 - this.force * 0.1)
    }
    x = x + this.direction
    y = y - 1
    if (world[x][y] === types.SPACE) {
      this.object.position.x = x * SIZE
    } else if (world[x][y] === types.GROUND) {
      this.object.direction = -this.direction
      this.object.position.x += this.direction * SIZE
    } else {
      this.object.position.x = x * SIZE
    }
    this.object.position.y -= SIZE
    this.force--
  }

  setColor(color, opacity = 1) {
    this.mesh.material.color.set(color)
    this.mesh.material.opacity = opacity
  }

  get x() {
    return this.object.position.x
  }

  get y() {
    return this.object.position.y
  }

  get worldPos() {
    return {
      x: Math.floor(this.x / SIZE),
      y: Math.floor(this.y / SIZE),
    }
  }
}
