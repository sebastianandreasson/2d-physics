import noise from '../utils/noise'
import { SIZE, generation } from '../utils/constants'
const {
  STRENGTH,
  ROUGHNESS,
  PERSISTENCE,
  LAYERS,
  BASE_ROUGHNESS,
  HORIZON,
  MIN_VALUE,
} = generation

class NoiseSettings {
  constructor({ strength, roughness, persistence, layers, baseRoughness }) {
    this.strength = strength ? strength : STRENGTH
    this.roughness = roughness ? roughness : ROUGHNESS
    this.persistence = persistence ? persistence : PERSISTENCE
    this.layers = layers ? layers : LAYERS
    this.baseRoughness = baseRoughness ? baseRoughness : BASE_ROUGHNESS
  }
}

console.log(noise.simplex2(0, 50), noise.simplex2(0, 51), noise.simplex2(0, 52))

export const shouldPlantTree = (x, y) => {
  return noise.simplex2(x * SIZE, y * SIZE) > 0.5
}

export const groundType = (x, y) => {
  return Math.abs(noise.simplex2(x, y)) > 0.1 ? 0 : 1
}

const initialNoiseFilter = (x, y) => {
  const settings = new NoiseSettings({})

  let noiseValue = 0
  let frequency = settings.baseRoughness
  let amplitude = 1
  for (let i = 0; i < LAYERS; i++) {
    const _x = x * frequency
    const _y = y * frequency
    let v = noise.simplex2(_x, _y)

    noiseValue += (v + 1) * 0.5 * amplitude

    frequency *= settings.roughness
    amplitude *= settings.persistence
  }

  return noiseValue * settings.strength
}

const mountainousNoiseFilter = (x, y) => {
  const settings = new NoiseSettings({
    roughness: 0.5,
    layers: 4,
    persistence: 2,
  })

  let noiseValue = 0
  let frequency = settings.baseRoughness
  let amplitude = 1
  let weight = 1
  for (let i = 0; i < LAYERS; i++) {
    const _x = x * frequency
    const _y = y * frequency
    let v = 1 - Math.abs(noise.simplex2(_x, _y))
    v *= v
    v *= weight
    weight = v

    noiseValue += v * amplitude

    frequency *= settings.roughness
    amplitude *= settings.persistence
  }

  return noiseValue * settings.strength
}

const filters = [initialNoiseFilter]

export const getElevation = (x, y, height) => {
  let noiseValue = 0

  for (let i = 0; i < filters.length; i++) {
    noiseValue += filters[i](x, y)
  }

  return noiseValue * height
}
