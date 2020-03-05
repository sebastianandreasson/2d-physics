export const SEED = 1339
export const WIDTH = 320
export const HEIGHT = 240
export const GRID_SPLIT = 2
export const SIZE = 5
export const GRID_WIDTH = Math.floor(WIDTH / GRID_SPLIT / SIZE)
export const GRID_HEIGHT = Math.floor(HEIGHT / GRID_SPLIT / SIZE)
export const BASELINE = Math.floor((HEIGHT / SIZE) * 0.65)
export const VELOCITY = 5

export const types = {
  SPACE: 0,
  WATER: 1,
  GROUND: 10,
  SOLID: 11,
}
export const colors = {
  WHITE: 0xffffff,
  SKY: 0x88e1f2,
  BLUE: 0x4f98ca,
  DARK_GREEN: 0x8cba51,
  GREEN: 0x21bf73,
  GRAY: 0x434e52,
  RED: 0xff0000,
  BROWN: 0xa35638,
  DIRT: 0xcfb495,
}
export const messages = {
  INIT: 'init',
  INIT_WORLD: 'init-world',
  OBJECT_CREATE: 'object-create',
  OBJECT_UPDATE: 'object-update',
  SIMULATE: 'simulate',
  WORLD: 'world',
}
export const simulation = {
  FIXED_TIMESTEP: 1 / 60,
  MAX_STEPS: 10,
  REPORT_CHUNK_SIZE: 5,
  SINGLE_STEP: false,
}
export const generation = {
  HORIZON: 100,
  STRENGTH: 1.25,
  BASE_ROUGHNESS: 0.000025,
  ROUGHNESS: 3,
  LAYERS: 4,
  PERSISTENCE: 0.25,
  MIN_VALUE: 1,
}
