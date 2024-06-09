// import { order_by, initialize } from '../pkg/index.js'
import * as pkg from '../pkg/index.js';
const {
  initialize,
  order_by,
  compact,
  clone_deep,
  merge,
  group_by,
  flatten_deep,
  uniq,
} = pkg;

export default {
  initialize,
  orderBy: order_by,
  compact,
  cloneDeep: clone_deep,
  merge: merge,
  groupBy: group_by,
  flattenDeep: flatten_deep,
  uniq: uniq,
}
