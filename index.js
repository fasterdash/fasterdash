import { base_order_by } from './pkg/index.js';

const objToSort = [
  {"name": "John", "age": 30},
  {"name": "Jane", "age": 25},
  {"name": "Doe", "age": 50}
];

console.log(objToSort);

const sortByName = base_order_by(objToSort, "name");
const sortByAge = base_order_by(objToSort, "age");

console.log({sortByName});
console.log({sortByAge});
