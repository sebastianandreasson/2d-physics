import * as PIXI from 'pixi.js'
import noise from '../utils/noise'
import {
  types,
  colors,
  SEED,
  SIZE,
  WIDTH,
  HEIGHT,
  generation,
} from '../utils/constants'
import { withinCircle } from '../utils/calc'
import { getElevation, shouldPlantTree } from './noiseFilters'
import Tree from './tree'

export default class World {
  constructor() {
    noise.seed(SEED)

    this.noiseFilters = []

    this.parts = [
      [this.generate(-1, -1), this.generate(0, -1), this.generate(1, -1)],
      [this.generate(-1, 0), this.generate(0, 0), this.generate(1, 0)],
      [this.generate(-1, 1), this.generate(0, 1), this.generate(1, 1)],
    ]
    this.xOffset = 1
    this.yOffset = 1
  }

  generate(xOffset, yOffset) {
    const width = Math.floor(WIDTH / SIZE)
    const height = Math.floor(HEIGHT / SIZE)
    const grid = {}

    const startX = width * xOffset
    const endX = startX + width

    const startY = yOffset * height
    const endY = startY + height

    console.log('startX', startX, startY)
    let yoff = startX * height

    for (let x = startX; x < endX; x++) {
      const elevation = getElevation(x, yoff, height)
      grid[x] = {}
      for (let y = startY; y <= endY; y++) {
        if (y < elevation) {
          grid[x][y] = {
            type: types.SPACE,
          }
        } else {
          grid[x][y] = {
            type: types.GROUND,
          }
        }
        yoff++
      }
    }

    return {
      xOffset,
      yOffset,
      grid,
      container: this.generateContainer(grid, xOffset, yOffset),
    }
  }

  generateContainer(grid, xOffset, yOffset) {
    const container = new PIXI.Container()
    container.x = xOffset * WIDTH
    container.y = yOffset * HEIGHT
    container.width = WIDTH
    container.height = HEIGHT
    const texture = PIXI.Texture.WHITE

    for (let x in grid) {
      for (let y in grid[x]) {
        if (grid[x][y].type === types.GROUND) {
          const sprite = new PIXI.Sprite(texture)
          sprite.tint = colors.GREEN
          sprite.x = x * SIZE - xOffset * WIDTH
          sprite.y = y * SIZE - yOffset * HEIGHT
          sprite.width = SIZE
          sprite.height = SIZE

          container.addChild(sprite)
        }
      }
    }

    // const outline = new PIXI.Graphics()
    // outline.lineStyle(1, colors.RED, 1)
    // outline.drawRect(0, 0, container.width, container.height)
    // outline.endFill()
    // container.addChild(outline)

    const gridX = Object.keys(grid)[0]
    const text = new PIXI.Text(`x: ${gridX}`)
    text.x = 10
    text.y = 10
    container.addChild(text)

    container.interactiveChildren = false
    container.cacheAsBitmap = true

    return container
  }

  removeParts(parts) {
    parts.forEach(part => {
      part.container.parent.removeChild(part.container)
      part.container.destroy({
        children: true,
        texture: true,
        baseTexture: true,
      })
    })
  }

  updateOffset(x, y) {
    const newXOffset = Math.floor(x / WIDTH)
    const newYOffset = Math.floor(y / HEIGHT / 2)

    if (newXOffset > this.xOffset) {
      this.xOffset = newXOffset
      this.removeParts([
        this.parts[0].shift(),
        this.parts[1].shift(),
        this.parts[2].shift(),
      ])
      const newParts = [
        this.generate(this.xOffset, this.yOffset - 1),
        this.generate(this.xOffset, this.yOffset),
        this.generate(this.xOffset, this.yOffset + 1),
      ]
      this.parts = [
        [...this.parts[0], newParts[0]],
        [...this.parts[1], newParts[1]],
        [...this.parts[2], newParts[2]],
      ]
      return newParts
    } else if (newXOffset < this.xOffset) {
      this.xOffset = newXOffset
      this.removeParts([
        this.parts[0].pop(),
        this.parts[1].pop(),
        this.parts[2].pop(),
      ])
      const newParts = [
        this.generate(this.xOffset, this.yOffset - 1),
        this.generate(this.xOffset, this.yOffset),
        this.generate(this.xOffset, this.yOffset + 1),
      ]
      this.parts = [
        [newParts[0], ...this.parts[0]],
        [newParts[1], ...this.parts[1]],
        [newParts[2], ...this.parts[2]],
      ]
      return newParts
    }
  }

  destroy(x, y, radius) {
    const container = this.parts[1][1].container
    const _x = x * SIZE
    const _y = y * SIZE
    const _radius = radius * SIZE

    console.log(_x, _y)

    const remove = () => {
      container.children.forEach(child => {
        if (withinCircle(_x, _y, child.position.x, child.position.y, _radius)) {
          container.removeChild(child)
          child.destroy({ texture: true, baseTexture: true })
        }
      })
    }

    container.cacheAsBitmap = false
    for (let i = 0; i < 4; i++) {
      remove()
    }
    container.cacheAsBitmap = true
  }
}
