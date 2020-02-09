import * as PIXI from 'pixi.js'
import World from './world'
import Water from './elements/water'
import Solid from './elements/solid'
import keyboard from './controls/keyboard'
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
let app

const physicsWorker = new PhysicsWorker()

const setupScene = () => {
  app = new PIXI.Application()
  app.renderer.backgroundColor = colors.SKY
  app.renderer.resize(WIDTH, HEIGHT)
  document.body.appendChild(app.view)

  app.ticker.add(draw)

  app.renderer.plugins.interaction.on('pointerup', onClick)

  const shift = keyboard('Shift')
  shift.press = () => {
    keys.shift = true
  }
  shift.release = () => {
    keys.shift = false
  }
  const space = keyboard(' ')
  space.press = () => physicsWorker.postMessage({ cmd: messages.SIMULATE })
}

const setupWorld = () => {
  world = new World()
  world.setGrid()
  const worldContainer = world.generateContainer(app.stage)
  app.stage.addChild(worldContainer)
  physicsWorker.postMessage({ cmd: messages.INIT_WORLD, payload: world.grid })
}

const createWater = (x, y) => {
  const chunk = []
  const amount = 8
  for (let i = -amount; i < amount; i++) {
    for (let j = -amount; j < amount; j++) {
      const water = new Water((x + i) * SIZE, (y + j) * SIZE)
      objects[water.id] = water
      app.stage.addChild(water.object)
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
  app.stage.addChild(solid.object)
}

const onClick = event => {
  const { x, y } = event.data.global
  console.log('click')
  console.log(x, y)
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
  physicsWorker.postMessage({ cmd: messages.SIMULATE })
}
setupScene()
setupWorld()
