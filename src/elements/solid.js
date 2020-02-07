import Element from './index'
import { SIZE, types, colors } from '../utils/constants'

export default class Solid extends Element {
  constructor(x, y, scale = 3) {
    super(x, y, colors.GRAY, scale)
    this.type = types.SOLID
    return this
  }
}
