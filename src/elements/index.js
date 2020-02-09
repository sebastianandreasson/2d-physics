import * as PIXI from 'pixi.js'
import { SIZE, types, colors } from '../utils/constants'
import { getId } from '../utils/globals'

const texture = PIXI.Texture.WHITE

export default class Element {
  constructor(x, y, color, scale = 1, transparent) {
    this.id = getId()
    const size = SIZE * scale
    const sprite = new PIXI.Sprite(texture)

    sprite.tint = color
    sprite.x = x
    sprite.y = y
    sprite.width = size
    sprite.height = size
    this.sprite = sprite
    this.size = scale
    this.color = color

    this.particle = false
  }

  get data() {
    return {
      id: this.id,
      x: this.sprite.position.x,
      y: this.sprite.position.y,
      alpha: Math.floor(this.sprite.alpha * 10),
      rotation: this.sprite.rotation.x,
      type: this.type,
      direction: this.direction,
      force: this.force,
      particle: this.particle,
      size: this.size,
    }
  }
}
