import * as pkg from './pkg/index.js';
const {
  initialize,
  compact,
} = pkg;

export default {
  initialize,
  compact,
  // Don't include sort since it's not ready yet. Sort currently only works if array is converted to a Uint32Array. For example Uint32Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
};
