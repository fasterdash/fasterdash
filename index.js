import fasterdash from './lib/index.js';

// Original array
let users = [
    { 'patron': 'jonny', 'age': 48 },
    { 'patron': 'john', 'age': 34 },
    { 'patron': 'john', 'age': 40 },
    { 'patron': 'jonny', 'age': 36 }
];

// Use of _.orderBy() method
// Sort by `patron` in ascending order
// and by `age` in descending order

let sortByAge = fasterdash.orderBy(users, ['patron', 'age'], ['asc', 'desc']);
let sortByName = fasterdash.orderBy(users, ['patron', 'age'], ['asc', 'desc']);

// Printing the output
console.log(sortByAge);
console.log(sortByName);
