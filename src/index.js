import * as THREE from 'three'
import World from './world'
import Water from './elements/water'
import Solid from './elements/solid'
import { types, colors, WIDTH, HEIGHT, SIZE } from './utils/constants'

let keys = {
  shift: false,
}
let world
let objects = []
let scene, camera, renderer

const setupScene = () => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(colors.SKY)
  const left = 0
  const right = WIDTH
  const top = 0
  const bottom = HEIGHT
  const near = -100
  const far = 100
  camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far)

  const dirLight = new THREE.DirectionalLight(0xffffff)
  dirLight.position.set(-1, 0, 1).normalize()
  scene.add(dirLight)

  camera.position.z = 5

  renderer = new THREE.WebGLRenderer()
  renderer.setSize(WIDTH, HEIGHT)
  document.body.appendChild(renderer.domElement)
  renderer.domElement.addEventListener('click', onClick, true)
  renderer.domElement.addEventListener('mousewheel', onScroll, false)
  document.addEventListener('keydown', e => onKey(e, true), false)
  document.addEventListener('keyup', e => onKey(e, false), false)
}

const setupWorld = () => {
  world = new World()
  world.setGrid()
  const worldMesh = world.generateMesh()
  scene.add(worldMesh)
}

const createWater = (x, y) => {
  if (world.grid[x] && world.grid[x][y]) {
    return
  }

  const amount = 10
  for (let i = -amount; i < amount; i++) {
    for (let j = -amount; j < amount; j++) {
      const water = new Water((x + i) * SIZE, (y + j) * SIZE)
      objects.push(water)
      scene.add(water.object)
    }
  }
}

const createSolid = (x, y) => {
  const solid = new Solid(x * SIZE, y * SIZE)
  objects.push(solid)
  scene.add(solid.object)
}

const onClick = ({ x, y }) => {
  console.log('click')
  console.log(x, y, camera.zoom)
  const localX = Math.floor(x / SIZE)
  const localY = Math.floor(y / SIZE)
  console.log(localX, localY)
  console.log('_______')
  if (keys.shift) {
    createSolid(localX, localY)
  } else {
    createWater(localX, localY)
  }
}

const onScroll = e => {
  console.log(camera.zoom)
  if (camera.zoom <= 0.2 && e.deltaY > 0) return
  camera.zoom += e.deltaY > 0 ? -0.1 : 0.1
  camera.updateProjectionMatrix()
}

const onKey = ({ which }, down) => {
  console.log('onKey', which, down)
  switch (which) {
    case 16:
      keys.shift = down
      break
    default:
      break
  }
  console.log(keys)
}

const displaceWater = (x, y) => {
  objects
    .filter(({ type }) => type === types.WATER)
    .filter(o => {
      const _x = Math.floor(o.x / SIZE)
      const _y = Math.floor(o.y / SIZE)
      return Math.abs(_x - x) <= 3 && Math.abs(_y - y) <= 3
    })
    .forEach(o => {
      const _x = Math.floor(o.x / SIZE)
      const _y = Math.floor(o.y / SIZE)
      world.grid[_x][_y] = types.SPACE
      o.makeParticle(4)
    })
}

const physics = () => {
  objects
    .filter(o => !o.stable)
    .forEach(o => {
      if (o.particle) {
        return o.particleSimulation(world.grid)
      }
      const pos = o.simulate(world.grid)
      if (pos) {
        switch (o.type) {
          case types.WATER:
            break
          case types.PARTICLE:
            break
          case types.SOLID:
            displaceWater(pos.x, pos.y)
            break
          default:
            break
        }
      }
    })
}

function draw() {
  requestAnimationFrame(draw)
  renderer.render(scene, camera)
  physics()
}
setupScene()
setupWorld()
draw()
