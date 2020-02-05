import * as THREE from 'three'
import Element from './index'
import { SIZE, types, colors } from '../utils/constants'

export default class Water extends Element {
  constructor(x, y) {
    super(x, y, colors.BLUE)
    this.material.transparent = true
    this.type = types.WATER
    return this
  }

  simulate(world) {
    const { x, y } = this.worldPos

    if (!world[x][y + 1]) {
      this.object.position.y += SIZE
      world[x][y] = types.SPACE
      world[x][y + 1] = types.WATER
    } else if (!world[x - 1][y + 1]) {
      this.object.position.y += SIZE
      this.object.position.x -= SIZE
      world[x][y] = types.SPACE
      world[x - 1][y + 1] = types.WATER
    } else if (!world[x + 1][y + 1]) {
      this.object.position.y += SIZE
      this.object.position.x += SIZE
      world[x][y] = types.SPACE
      world[x + 1][y + 1] = types.WATER
    } else if (!world[x + 1][y] && Math.random() > 0.2) {
      this.object.position.x += SIZE
      world[x][y] = types.SPACE
      world[x + 1][y] = types.WATER
    } else if (!world[x - 1][y]) {
      this.object.position.x -= SIZE
      world[x][y] = types.SPACE
      world[x - 1][y] = types.WATER
    }
  }
}
