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
  GREEN: 0x21bf73,
  GRAY: 0x434e52,
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
  MAX_STEPS: 1,
  REPORT_CHUNK_SIZE: 3,
  SINGLE_STEP: false,
}

// big
// export const SEED = 1339
// export const WIDTH = self.innerWidth
// export const HEIGHT = self.innerHeight
// export const SIZE = 10
// export const INC = 0.0025
// export const WEIGHT = 15
// export const GRID_WIDTH = Math.floor(WIDTH / SIZE) * 4
// export const GRID_HEIGHT = Math.floor(HEIGHT / SIZE)
// export const BASELINE = Math.floor(GRID_HEIGHT * 0.65)

// small
export const SEED = 1339
export const WIDTH = self.innerWidth
export const HEIGHT = self.innerHeight
export const SIZE = 4
export const INC = 0.00025
export const WEIGHT = 50
export const GRID_WIDTH = Math.floor(WIDTH / SIZE) * 4
export const GRID_HEIGHT = Math.floor(HEIGHT / SIZE)
export const BASELINE = Math.floor(GRID_HEIGHT * 0.65)
