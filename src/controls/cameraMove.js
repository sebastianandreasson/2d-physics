import keyboard from './keyboard'
import { VELOCITY } from '../utils/constants'

const controls = {
  vx: 0,
  vy: 0,
}

export default () => {
  const left = keyboard('ArrowLeft')
  left.press = () => {
    controls.vx = -VELOCITY
  }
  left.release = () => {
    controls.vx = 0
  }
  const right = keyboard('ArrowRight')
  right.press = () => {
    controls.vx = VELOCITY
  }
  right.release = () => {
    controls.vx = 0
  }
  const down = keyboard('ArrowDown')
  down.press = () => {
    controls.vy = VELOCITY
  }
  down.release = () => {
    controls.vy = 0
  }
  const up = keyboard('ArrowUp')
  up.press = () => {
    controls.vy = -VELOCITY
  }
  up.release = () => {
    controls.vy = 0
  }

  return controls
}
