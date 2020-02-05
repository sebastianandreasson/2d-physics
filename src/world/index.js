import * as THREE from 'three'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils'
import noise from '../utils/noise'
import {
  types,
  colors,
  SEED,
  SIZE,
  WIDTH,
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
        if (y < startY) continue
        const xMove = 0 // noise.simplex2(xoff, yoff) * WEIGHT
        this.grid[x][y] = types.GROUND
        yoff += INC
      }
      xoff += INC
    }
  }

  generateMesh() {
    const geometry = new THREE.PlaneBufferGeometry(SIZE, SIZE)
    const geometries = []

    for (let x in this.grid) {
      for (let y in this.grid[x]) {
        const geo = geometry.clone()
        geo.applyMatrix(
          new THREE.Matrix4().makeTranslation(
            x * SIZE + SIZE / 2,
            y * SIZE + SIZE / 2,
            0
          )
        )
        geometries.push(geo)
      }
    }

    return new THREE.Mesh(
      BufferGeometryUtils.mergeBufferGeometries(geometries),
      new THREE.MeshBasicMaterial({
        color: colors.GREEN,
        side: THREE.DoubleSide,
      })
    )
  }
}
