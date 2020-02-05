export const types = {
  SPACE: 0,
  GROUND: 1,
  WATER: 2,
  SOLID: 3,
  PARTICLE: 10,
}
export const colors = {
  WHITE: 0xffffff,
  SKY: 0x88e1f2,
  BLUE: 0x4f98ca,
  GREEN: 0x21bf73,
  GRAY: 0x434e52,
}

export const SEED = 1339
export const WIDTH = window.innerWidth
export const HEIGHT = window.innerHeight
export const SIZE = 4
export const INC = 0.00025
export const WEIGHT = 50
export const GRID_WIDTH = Math.floor(WIDTH / SIZE) * 4
export const GRID_HEIGHT = Math.floor(HEIGHT / SIZE)
export const BASELINE = Math.floor(GRID_HEIGHT * 0.65)
