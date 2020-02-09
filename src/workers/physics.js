import { messages, simulation, types, colors, SIZE } from '../utils/constants'

const cache = {}
let world = {}
let lastUpdate
let lastDuration
let simulating = false
let creating = false
let lastSubStep

const init = sharedBuffer => {
  buffer = sharedBuffer
}
const initWorld = grid => {
  world = grid
}

const createObject = obj => {
  const x = Math.floor(obj.x / SIZE)
  const y = Math.floor(obj.y / SIZE)
  cache[obj.id] = {
    ...obj,
    ...{ x, y },
    velocity: 0,
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
  o.direction = Math.random() > 0.5 ? 1 : -1
  o.force = force + Math.floor(Math.random() * force)
  o.alpha = 1 - force
}

const simulateParticle = o => {
  let { x, y } = o

  if (o.force <= 0) {
    o.particle = false
    o.alpha = 10
  } else {
    o.alpha = 10 - o.force
  }
  x = x + o.direction
  y = y - 1
  if (world[x][y].type >= types.GROUND) {
    o.direction = -o.direction
  }
  o.x += o.direction
  o.y--
  o.force--
}

const simulateSolid = o => {
  const { x, y } = o

  let collision = false
  for (let i = 0; i < o.size; i++) {
    const _type = world[x + i][y + o.size].type
    if (_type >= types.GROUND) {
      collision = true
    }
  }
  if (!collision) {
    o.y++
    for (let i = 0; i < o.size; i++) {
      world[x + i][y] = { type: types.SPACE }
      if (world[x + i][y + o.size].type === types.WATER) {
        displaceWater(x + i, y + o.size, o.size)
      }
      world[x + i][y + o.size] = { type: types.SOLID, id: o.id }
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
  if (
    o.velocity > 0 &&
    Math.abs(o.y - y) === 0 &&
    !world[x][y - 1].type &&
    world[x][y + 1].type === types.WATER
  ) {
    o.alpha = 5
  } else {
    o.alpha = 10
  }

  o.velocity = Math.abs(o.y - y)
}

const simulateElement = id => {
  const obj = cache[id]
  if (obj && obj.particle) {
    simulateParticle(obj)
  } else if (obj) {
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
}

const simulateDebug = (steps, substep) => {
  if (steps === 0) {
    return
  }
  simulateElement(substep)
  if (simulation.SINGLE_STEP) {
    lastSubStep = substep <= 1 ? Object.keys(cache).length : substep - 1
    return
  }
  return simulate(
    substep <= 1 ? steps - 1 : steps,
    substep <= 1 ? Object.keys(cache).length : substep - 1
  )
}

const simulate = steps => {
  if (steps === 0) {
    return
  }
  for (let id in cache) {
    simulateElement(id)
  }
  simulate(steps - 1)
}

const report = () => {
  const length = Object.keys(cache).length
  const data = new Uint16Array(1 + simulation.REPORT_CHUNK_SIZE * length)
  data[0] = length

  let offset = 1
  for (let id in cache) {
    const obj = cache[id]

    data[offset] = obj.id
    data[offset + 1] = obj.x * SIZE
    data[offset + 2] = obj.y * SIZE
    data[offset + 3] = obj.alpha

    offset += simulation.REPORT_CHUNK_SIZE
  }
  postMessage(data)
}

const startSimulation = () => {
  if (simulating || creating) {
    return true
  }
  simulating = true
  let timeStep = 0
  if (lastUpdate) {
    while (timeStep + lastDuration <= simulation.FIXED_TIMESTEP) {
      timeStep = (Date.now() - lastUpdate) / 1000
    }
  } else {
    timeStep = simulation.FIXED_TIMESTEP
  }

  let steps = Math.min(
    Math.ceil(timeStep / simulation.FIXED_TIMESTEP),
    simulation.MAX_STEPS
  )
  lastDuration = Date.now()

  if (simulation.SINGLE_STEP) {
    simulateDebug(steps, lastSubStep ? lastSubStep : Object.keys(cache).length)
  } else {
    simulate(steps)
  }

  report()

  lastDuration = (Date.now() - lastDuration) / 1000

  lastUpdate = Date.now()
  simulating = false
}

self.addEventListener('message', ({ data }) => {
  const { cmd, payload } = data
  switch (cmd) {
    case messages.INIT:
      init(payload)
      break
    case messages.INIT_WORLD:
      initWorld(payload)
      break
    case messages.OBJECT_CREATE:
      creating = true
      if (payload.length) {
        payload.reverse().forEach(obj => createObject(obj))
      } else {
        createObject(payload)
      }
      creating = false
      console.log('amount', Object.keys(cache).length)
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
