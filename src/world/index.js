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

const getElevation = (x, y) => {
  const {
    STRENGTH,
    ROUGHNESS,
    PERSISTENCE,
    LAYERS,
    BASE_ROUGHNESS,
    HORIZON,
    MIN_VALUE,
  } = generation

  let noiseValue = 0
  let frequency = BASE_ROUGHNESS
  let amplitude = 1
  for (let i = 0; i < LAYERS; i++) {
    const _x = x * frequency
    const _y = y * frequency
    let v = noise.simplex2(_x, _y)

    noiseValue += (v + 1) * 0.5 * amplitude

    frequency *= ROUGHNESS
    amplitude *= PERSISTENCE
  }

  // noiseValue = Math.min(0, noiseValue - MIN_VALUE)

  return HORIZON + noiseValue * STRENGTH
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
    console.log('startX', startX)
    let yoff = startX * height

    for (let x = startX; x < endX; x++) {
      const startY = getElevation(x, yoff)
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
        yoff++
      }
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

  destroy(x, y, radius) {
    const container = this.parts[1].container
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
