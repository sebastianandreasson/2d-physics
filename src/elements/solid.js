import Element from './index'
import { SIZE, types, colors } from '../utils/constants'

export default class Solid extends Element {
  constructor(x, y) {
    super(x, y, colors.GRAY, 3)
    this.type = types.SOLID
    return this
  }

  simulate(world) {
    const { x, y } = this.worldPos

    const speed = !world[x][y + 6] ? 2 : 1
    if (
      world[x] &&
      world[x][y + 3] !== types.GROUND &&
      world[x][y + 3] !== types.SOLID
    ) {
      this.object.position.y += SIZE * speed
      world[x][y - 2] = types.SPACE
      world[x][y - 1] = types.SPACE
      world[x][y] = types.SPACE
      world[x][y + 1] = types.SOLID
      if (world[x][y + 3] === types.WATER) {
        return { x, y }
      }
    }
  }
}
