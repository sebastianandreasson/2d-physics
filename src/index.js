import * as PIXI from 'pixi.js'
import 'pixi-layers'
import { Viewport } from 'pixi-viewport'
import World from './world'
import Water from './elements/water'
import Solid from './elements/solid'
import { keys, keyPress } from './controls/keyboard'
import { withinCircle } from './utils/calc'
// import cameraControls from './controls/cameraMove'
import PhysicsWorker from 'worker-loader!./workers/physics.js'
import {
  colors,
  WIDTH,
  HEIGHT,
  SIZE,
  messages,
  simulation,
} from './utils/constants'

let world
let viewport
let objects = {}
let app

const physicsWorker = new PhysicsWorker()
const elementsContainer = new PIXI.ParticleContainer(25000, { tint: true })

const setupScene = () => {
  app = new PIXI.Application()
  app.stage = new PIXI.display.Stage()
  app.renderer.backgroundColor = colors.SKY
  app.renderer.resize(WIDTH, HEIGHT)

  viewport = new Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: 1000,
    worldHeight: 1000,

    interaction: app.renderer.plugins.interaction, // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
  })

  app.stage.addChild(viewport)

  // activate plugins
  viewport
    .drag()
    .pinch()
    .wheel()
    .decelerate()

  // app.stage.controls = cameraControls()
  document.body.appendChild(app.view)

  // const lighting = new PIXI.display.Layer()
  // lighting.on('display', element => {
  //   element.blendMode = PIXI.BLEND_MODES.ADD
  // })
  // lighting.useRenderTexture = true
  // lighting.clearColor = [0.078, 0.16, 0.32, 0.5] // ambient blue
  // app.stage.addChild(lighting)

  // const lightingSprite = new PIXI.Sprite(lighting.getRenderTexture())
  // lightingSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY

  // app.stage.addChild(lightingSprite)

  app.ticker.add(draw)

  app.renderer.plugins.interaction.on('pointerup', onClick)

  keyPress('Shift')
  keyPress('Alt')
  keyPress(' ', () => {
    physicsWorker.postMessage({ cmd: messages.SIMULATE })
  })
}

const setupWorld = () => {
  world = new World()

  // for (let i = 0; i < world.parts.length; i++) {
  //   for (let j = 0; j < world.parts[i].length; j++) {
  //     const container = world.parts[i][j].container
  //     viewport.addChild(container)
  //   }
  // }
  // physicsWorker.postMessage({
  //   cmd: messages.INIT_WORLD,
  //   payload: world.parts[1][1].grid,
  // })
  viewport.addChild(world.part.container)
  physicsWorker.postMessage({
    cmd: messages.INIT_WORLD,
    payload: world.part.grid,
  })
  viewport.addChild(elementsContainer)
}

const updateWorld = (x, y) => {
  // const parts = world.updateOffset(x, y)
  // if (parts) {
  //   parts.forEach(part => {
  //     app.stage.addChild(part.container)
  //   })
  // }
}

const createWater = (x, y, amount = 10) => {
  const chunk = []
  for (let i = 0; i < amount; i++) {
    for (let j = 0; j < amount; j++) {
      if (withinCircle(i, j, amount / 2, amount / 2, amount / 2)) {
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

const createWaterfall = (x, y) => {
  setInterval(() => {
    createWater(x, y, 3)
  }, 25)
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
  // app.stage.x -= app.stage.controls.vx
  // app.stage.y -= app.stage.controls.vy
  // updateWorld(WIDTH - app.stage.x, HEIGHT - app.stage.y)
}
setupScene()
setupWorld()
