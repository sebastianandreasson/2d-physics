import Element from './index'
import { SIZE, types, colors } from '../utils/constants'

export default class Solid extends Element {
  constructor(x, y) {
    super(x, y, colors.GRAY, 3)
    this.type = types.SOLID
    return this
  }
}
