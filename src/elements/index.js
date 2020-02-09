import * as PIXI from 'pixi.js'
import { SIZE, types, colors } from '../utils/constants'
import { getId } from '../utils/globals'

export default class Element {
  constructor(x, y, color, scale = 1, transparent) {
    this.id = getId()
    const size = SIZE * scale
    const object = new PIXI.Sprite(PIXI.Texture.WHITE)

    object.tint = color
    object.x = x
    object.y = y
    object.width = size
    object.height = size
    this.object = object
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
