// import { order_by, initialize } from '../pkg/index.js'
import * as pkg from '../pkg/index.js';
const { order_by, compact, initialize } = pkg;

export default {
  orderBy: order_by,
  compact,
  initialize,
}
