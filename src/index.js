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
  VELOCITY,
  messages,
  simulation,
} from './utils/constants'

let keys = {
  shift: false,
  alt: false,
}
let world
let objects = {}
let app

const physicsWorker = new PhysicsWorker()
const elementsContainer = new PIXI.ParticleContainer(25000, { tint: true })

const setupScene = () => {
  app = new PIXI.Application()
  app.renderer.backgroundColor = colors.SKY
  app.renderer.resize(WIDTH, HEIGHT)
  app.stage.vx = 0
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
  const alt = keyboard('Alt')
  alt.press = () => {
    keys.alt = true
  }
  alt.release = () => {
    keys.alt = false
  }
  const space = keyboard(' ')
  space.press = () => physicsWorker.postMessage({ cmd: messages.SIMULATE })

  const left = keyboard('ArrowLeft')
  left.press = () => {
    app.stage.vx = -VELOCITY
  }
  left.release = () => {
    app.stage.vx = 0
  }
  const right = keyboard('ArrowRight')
  right.press = () => {
    app.stage.vx = VELOCITY
  }
  right.release = () => {
    app.stage.vx = 0
  }
}

const setupWorld = () => {
  world = new World()
  for (let i = 0; i < world.parts.length; i++) {
    const container = world.parts[i].container
    app.stage.addChild(container)
  }
  physicsWorker.postMessage({
    cmd: messages.INIT_WORLD,
    payload: world.parts[1].grid,
  })
  app.stage.addChild(elementsContainer)
}

const updateWorld = x => {
  const part = world.updateOffset(x)
  if (part) {
    app.stage.addChild(part.container)
  }
}

const createWater = (x, y) => {
  const chunk = []
  const amount = 10
  for (let i = 0; i < amount; i++) {
    for (let j = 0; j < amount; j++) {
      var inCircle =
        (i - amount / 2) * (i - amount / 2) +
          (j - amount / 2) * (j - amount / 2) <=
        (amount / 2) * (amount / 2)
      if (inCircle) {
        const water = new Water((x + i) * SIZE, (y + j) * SIZE)
        objects[water.id] = water
        elementsContainer.addChild(water.sprite)
        chunk.push(water.data)
      }
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
  elementsContainer.addChild(solid.sprite)
}

const destroyGround = (x, y) => {
  const radius = 5
  world.destroy(x, y, radius)
  physicsWorker.postMessage({
    cmd: messages.DESTORY,
    payload: {
      x,
      y,
      radius,
    },
  })
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
  } else if (keys.alt) {
    createWater(localX, localY)
  } else {
    destroyGround(localX, localY)
  }
}

const updateScene = arr => {
  let offset = 1
  for (let i = 0; i < arr[0]; i++) {
    const id = arr[offset]
    const obj = objects[id]
    const x = arr[offset + 1]
    const y = arr[offset + 2]
    obj.sprite.position.set(x, y, 0)
    const alpha = arr[offset + 3]
    if (alpha === 10) {
      obj.sprite.tint = obj.color
    } else {
      obj.sprite.tint = colors.WHITE
    }
    obj.sprite.alpha = arr[offset + 3] / 10

    offset += simulation.REPORT_CHUNK_SIZE
  }
}

physicsWorker.onmessage = ({ data }) => updateScene(data)

function draw() {
  physicsWorker.postMessage({ cmd: messages.SIMULATE })
  app.stage.x -= app.stage.vx
  updateWorld(WIDTH + -app.stage.x)
}
setupScene()
setupWorld()
