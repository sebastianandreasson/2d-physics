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
  GRID_WIDTH,
  GRID_HEIGHT,
  BASELINE,
  INC,
} from '../utils/constants'

export default class World {
  constructor() {
    noise.seed(SEED)

    this.grid = {}
  }

  setGrid() {
    this.grid = {}

    let xoff = 0
    let yoff = 0

    const startX = GRID_WIDTH * SIZE > WIDTH ? Math.floor(-GRID_WIDTH / 2) : 0
    const endX =
      GRID_WIDTH * SIZE > WIDTH ? Math.floor(GRID_WIDTH / 2) : GRID_WIDTH
    for (let x = startX; x < endX; x++) {
      const startY = BASELINE + WEIGHT * noise.simplex2(xoff, yoff)
      this.grid[x] = {}
      for (let y = GRID_HEIGHT; y > 0; y--) {
        if (y < startY) {
          this.grid[x][y] = {
            type: types.SPACE,
          }
          continue
        }
        const xMove = 0 // noise.simplex2(xoff, yoff) * WEIGHT
        this.grid[x][y] = {
          type: types.GROUND,
        }
        yoff += INC
      }
      xoff += INC
    }
  }

  // gridChunk() {
  //   const grid = {}

  //   for (let x in this.grid) {
  //     if ()
  //     for (let y in this.grid[x]) {
  //     }
  //   }
  // }

  generateContainer() {
    const container = new PIXI.Container()
    // container.x = (WIDTH - WIDTH / 2) / 2
    // container.y = (HEIGHT - HEIGHT / 2) / 2
    // container.width = GRID_WIDTH * SIZE
    // container.height = GRID_HEIGHT * SIZE
    const texture = PIXI.Texture.WHITE

    for (let x in this.grid) {
      for (let y in this.grid[x]) {
        if (this.grid[x][y].type === types.GROUND) {
          const sprite = new PIXI.Sprite(texture)
          sprite.tint = colors.GREEN
          sprite.x = x * SIZE
          sprite.y = y * SIZE
          sprite.width = SIZE
          sprite.height = SIZE

          container.addChild(sprite)
        }
      }
    }

    // const outline = new PIXI.Graphics()
    // outline.lineStyle(2, colors.RED, 1)
    // outline.drawRect(0, 0, container.width, container.height)
    // outline.endFill()
    // container.addChild(outline)

    container.interactiveChildren = false
    container.cacheAsBitmap = true

    return container
  }
}
