import _ from 'lodash'
import fasterdash from './lib/index.js';

fasterdash.initialize();

const generateDataCompact = (size) => {
    let largeArray = [];
    for (let i = 0; i < size; i++) {
      largeArray.push(i % 10 === 0 ? 0 : i);
    }
    return largeArray;
  };

const compactData = generateDataCompact(100);

console.log({lodashCompact: _.compact(compactData)});
console.log({fasterdashCompact: fasterdash.compact(compactData)});
