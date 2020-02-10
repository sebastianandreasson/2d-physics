import * as PIXI from 'pixi.js'
import { SIZE, colors } from '../utils/constants'

const texture = PIXI.Texture.WHITE

export default class Tree {
  constructor(x, y) {
    const container = new PIXI.Container()
    container.x = x
    container.y = y
    const trunk = new PIXI.Sprite(texture)
    trunk.tint = colors.BROWN
    trunk.width = SIZE
    trunk.height = SIZE * 2
    container.addChild(trunk)

    const leaves = new PIXI.Sprite(texture)
    leaves.tint = colors.DARK_GREEN
    leaves.width = SIZE * 3
    leaves.height = SIZE * 5
    leaves.x -= SIZE
    leaves.y -= leaves.height
    container.addChild(leaves)

    this.container = container
  }
}
