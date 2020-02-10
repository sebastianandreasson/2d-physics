import * as PIXI from 'pixi.js'
import noise from '../utils/noise'
import {
  types,
  colors,
  SEED,
  SIZE,
  WIDTH,
  HEIGHT,
  WEIGHT,
  GRID_SPLIT,
  GRID_WIDTH,
  GRID_HEIGHT,
  BASELINE,
  INC,
} from '../utils/constants'

const octavePerlin = (x, y, octaves = 4, persistence = 2) => {
  let total = 0
  let frequency = 1
  let amplitude = 1
  for (let i = 0; i < octaves; i++) {
    total += noise.simplex2(x * frequency, y * frequency) * amplitude

    amplitude *= persistence
    frequency *= 2
  }

  return total
}

export default class World {
  constructor() {
    noise.seed(SEED)

    this.parts = [this.generate(-1), this.generate(0), this.generate(1)]
    this.offset = 0
  }

  generate(offset) {
    const width = Math.floor(WIDTH / SIZE)
    const height = Math.floor(HEIGHT / SIZE)
    const grid = {}

    const startX = width * offset
    const endX = startX + width
    let xoff = startX * INC
    let yoff = startX * INC * height

    for (let x = startX; x < endX; x++) {
      const startY = BASELINE + WEIGHT * octavePerlin(xoff, yoff)
      grid[x] = {}
      for (let y = height; y > 0; y--) {
        if (y < startY) {
          grid[x][y] = {
            type: types.SPACE,
          }
        } else {
          grid[x][y] = {
            type: types.GROUND,
          }
        }
        yoff += INC
      }
      xoff += INC
    }

    return {
      offset,
      grid,
      container: this.generateContainer(grid, offset),
    }
  }

  generateContainer(grid, offset) {
    const container = new PIXI.Container()
    container.x = offset * WIDTH
    container.y = 0
    container.width = WIDTH
    container.height = HEIGHT
    const texture = PIXI.Texture.WHITE

    for (let x in grid) {
      for (let y in grid[x]) {
        if (grid[x][y].type === types.GROUND) {
          const sprite = new PIXI.Sprite(texture)
          sprite.tint = colors.GREEN
          sprite.x = x * SIZE - offset * WIDTH
          sprite.y = y * SIZE
          sprite.width = SIZE
          sprite.height = SIZE

          container.addChild(sprite)
        }
      }
    }

    const outline = new PIXI.Graphics()
    outline.lineStyle(1, colors.RED, 1)
    outline.drawRect(0, 0, container.width, container.height)
    outline.endFill()
    container.addChild(outline)

    const gridX = Object.keys(grid)[0]
    const text = new PIXI.Text(`x: ${gridX}`)
    text.x = 10
    text.y = 10
    container.addChild(text)

    container.interactiveChildren = false
    container.cacheAsBitmap = true

    return container
  }

  updateOffset(x) {
    const newOffset = Math.floor(x / WIDTH)
    if (newOffset > this.offset) {
      this.offset = newOffset
      const oldPart = this.parts.shift()
      oldPart.container.parent.removeChild(oldPart.container)
      oldPart.container.destroy({
        children: true,
        texture: true,
        baseTexture: true,
      })
      const newPart = this.generate(this.offset)
      this.parts = [...this.parts, newPart]
      return newPart
    } else if (newOffset < this.offset) {
      this.offset = newOffset
      const oldPart = this.parts.pop()
      oldPart.container.parent.removeChild(oldPart.container)
      oldPart.container.destroy({
        children: true,
        texture: true,
        baseTexture: true,
      })
      const newPart = this.generate(this.offset - 1)
      this.parts = [newPart, ...this.parts]
      return newPart
    }
  }
}
