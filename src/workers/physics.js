import { messages, simulation, types, colors, SIZE } from '../utils/constants'

const cache = {}
let world = {}
let lastUpdate
let lastDuration
let simulating = false
let creating = false

const init = grid => {
  world = grid
}

const createObject = obj => {
  const x = Math.floor(obj.x / SIZE)
  const y = Math.floor(obj.y / SIZE)
  cache[obj.id] = {
    ...obj,
    ...{ x, y },
  }
  if (obj.size === 1) {
    world[x][y] = {
      type: obj.type,
      id: obj.id,
    }
  } else {
    for (let i = 0; i < obj.size; i++) {
      for (let j = 0; j < obj.size; j++) {
        world[x + i][y + j] = {
          type: obj.type,
          id: obj.id,
        }
      }
    }
  }
}

const deleteObject = id => {
  const { x, y } = cache[id]
  world[x][y] = types.SPACE
  delete cache[id]
}

const displaceWater = (x, y, force = 2) => {
  const id = world[x][y].id
  const o = cache[id]

  o.particle = true
  o.event = ['setColor', colors.WHITE]
  o.direction = Math.random() > 0.5 ? 1 : -1
  o.force = force + Math.floor(Math.random() * force)
}

const simulateParticle = o => {
  let { x, y } = o

  if (o.force <= 0) {
    o.event = ['setColor', colors.BLUE]
    o.particle = false
  } else {
    o.event = ['setColor', colors.WHITE, 1 - o.force * 0.1]
  }
  x = x + o.direction
  y = y - 1
  if (world[x][y] === types.SPACE) {
    o.x++
  } else if (world[x][y] === types.GROUND) {
    o.direction = -o.direction
    o.x += o.direction * SIZE
  } else {
    o.x++
    o.force--
  }
  o.y--
  o.force--
}

const simulateSolid = o => {
  const { x, y } = o

  if (
    world[x][y + o.size].type !== types.GROUND &&
    world[x][y + o.size].type !== types.SOLID
  ) {
    o.y++
    for (let i = 0; i < o.size; i++) {
      world[x + i][y] = { type: types.SPACE }
      if (world[x + i][y + 1].type === types.WATER) {
        displaceWater(x + i, y + 1, 4)
      }
      world[x + i][y + 1] = { type: types.SOLID, id: o.id }
    }
  }
}

const simulateWater = o => {
  const { x, y } = o
  if (!world[x][y + 1].type) {
    o.y++
    world[x][y] = { type: types.SPACE }
    world[x][y + 1] = { type: types.WATER, id: o.id }
  } else if (!world[x - 1][y + 1].type) {
    o.y++
    o.x--
    world[x][y] = { type: types.SPACE }
    world[x - 1][y + 1] = { type: types.WATER, id: o.id }
  } else if (!world[x + 1][y + 1].type) {
    o.y++
    o.x++
    world[x][y] = { type: types.SPACE }
    world[x + 1][y + 1] = { type: types.WATER, id: o.id }
  } else if (!world[x + 1][y].type && Math.random() > 0.2) {
    o.x++
    world[x][y] = { type: types.SPACE }
    world[x + 1][y] = { type: types.WATER, id: o.id }
  } else if (!world[x - 1][y].type) {
    o.x--
    world[x][y] = { type: types.SPACE }
    world[x - 1][y] = { type: types.WATER, id: o.id }
  }
}

const simulate = (steps, events = []) => {
  if (steps === 0) {
    return
  }
  for (let id in cache) {
    const obj = cache[id]
    if (obj.particle) {
      simulateParticle(obj)
      continue
    }
    switch (obj.type) {
      case types.WATER:
        simulateWater(obj)
        break
      case types.SOLID:
        simulateSolid(obj)
      default:
        break
    }
  }
  return simulate(steps - 1)
}

const report = () => {
  const vectors = []
  for (let id in cache) {
    const obj = cache[id]
    const event = obj.event
    delete obj.event
    vectors.push({
      id: obj.id,
      pos: [obj.x * SIZE, obj.y * SIZE],
      event,
    })
  }

  postMessage({ cmd: messages.WORLD, payload: vectors })
}

const startSimulation = () => {
  if (simulating || creating) {
    return true
  }
  simulating = true
  let timeStep = 0
  if (lastUpdate) {
    while (timeStep + lastDuration <= simulation.fixedTimeStep) {
      timeStep = (Date.now() - lastUpdate) / 1000
    }
  } else {
    timeStep = simulation.fixedTimeStep
  }

  let steps = Math.max(
    Math.ceil(timeStep / simulation.fixedTimeStep),
    simulation.maxSteps
  )
  lastDuration = Date.now()

  simulate(steps)

  report()

  lastDuration = (Date.now() - lastDuration) / 1000

  lastUpdate = Date.now()
  simulating = false
}

self.addEventListener('message', event => {
  const { cmd, payload } = event.data
  switch (cmd) {
    case messages.INIT_WORLD:
      init(payload)
      break
    case messages.OBJECT_CREATE:
      creating = true
      if (payload.length) {
        payload.forEach(obj => createObject(obj))
      } else {
        createObject(payload)
      }
      creating = false
      break
    case messages.OBJECT_UPDATE:
      break
    case messages.SIMULATE:
      startSimulation()
      break
    default:
      break
  }
})
