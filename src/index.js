import * as THREE from 'three'
import World from './world'
import Water from './elements/water'
import Solid from './elements/solid'
import PhysicsWorker from 'worker-loader!./workers/physics.js'
import {
  types,
  colors,
  WIDTH,
  HEIGHT,
  SIZE,
  messages,
  simulation,
} from './utils/constants'

let keys = {
  shift: false,
}
let world
let objects = {}
let scene, camera, renderer

const physicsWorker = new PhysicsWorker()
const buffer = new ArrayBuffer(1)
// physicsWorker.postMessage(buffer, [buffer])

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
  physicsWorker.postMessage({ cmd: messages.INIT_WORLD, payload: world.grid })
  scene.add(worldMesh)
}

const createWater = (x, y) => {
  const chunk = []
  const amount = 5
  for (let i = -amount; i < amount; i++) {
    for (let j = -amount; j < amount; j++) {
      const water = new Water((x + i) * SIZE, (y + j) * SIZE)
      objects[water.id] = water
      scene.add(water.object)
      chunk.push(water.data)
    }
  }
  physicsWorker.postMessage({
    cmd: messages.OBJECT_CREATE,
    payload: chunk,
  })
}

const createSolid = (x, y) => {
  const solid = new Solid(x * SIZE, y * SIZE, 10)
  physicsWorker.postMessage({
    cmd: messages.OBJECT_CREATE,
    payload: solid.data,
  })
  objects[solid.id] = solid
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
  switch (which) {
    case 16:
      keys.shift = down
      break
    default:
      physicsWorker.postMessage({ cmd: messages.SIMULATE })
      break
  }
}

const updateScene = arr => {
  let offset = 1
  for (let i = 0; i < arr[0]; i++) {
    const id = arr[offset]
    const x = arr[offset + 1]
    const y = arr[offset + 2]
    objects[id].object.position.set(x, y, 0)

    offset += simulation.REPORT_CHUNK_SIZE
  }
}

physicsWorker.onmessage = ({ data }) => updateScene(data)

function draw() {
  requestAnimationFrame(draw)
  renderer.render(scene, camera)
  physicsWorker.postMessage({ cmd: messages.SIMULATE })
}
setupScene()
setupWorld()
draw()
