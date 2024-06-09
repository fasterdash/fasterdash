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

fasterdash.initialize();
let sortByAgeAsc = fasterdash.orderBy(users, ['age'], ['asc']);
let sortByAgeAscWithDefault = fasterdash.orderBy(users, ['age']);
let sortByAgeDesc = fasterdash.orderBy(users, ['age'], ['desc']);
let sortByNameAsc = fasterdash.orderBy(users, ['patron'], ['asc']);
let sortByNameDesc = fasterdash.orderBy(users, ['patron'], ['desc']);
let sortByNameAscAgeDesc = fasterdash.orderBy(users, ['patron', 'age'], ['asc', 'desc']);

// Printing the output
console.log({sortByAgeAsc});
console.log({sortByAgeAscWithDefault});
console.log({sortByAgeDesc});
console.log({sortByNameAsc});
console.log({sortByNameDesc});
console.log({sortByNameAscAgeDesc});
