import Benchmark from 'benchmark';
import fs from 'fs';
import _ from 'lodash';
import fasterdash from '../lib/index.js';
import htmlToImage from 'node-html-to-image';
import process from 'process';

const generateData = (size, mode) => {
  switch (mode) {
    case 'orderBy':
      return [
        Array.from({ length: size }, (_, i) => ({
          id: i,
          value: Math.random(),
          value2: Math.random(),
          value3: Math.random(),
          value4: Math.random()
        })),
        ['value', 'value2', 'value3', 'value4'],
        ['asc', 'desc', 'asc', 'desc']
      ];
    case 'compact':
      return [
        Array.from({ length: size }, (_, i) => (i % 10 === 0 ? 0 : i))
      ];
    case 'cloneDeep':
      return [
        Array.from({ length: size }, (_, i) => ({
          id: i,
          nested: {
            level1: {
              level2: {
                value: Math.random()
              }
            }
          }
        }))
      ];
    case 'merge':
      return [
        Array.from({ length: size }, (_, i) => ({ id: i, value: Math.random() })),
        Array.from({ length: size }, (_, i) => ({ id: i, otherValue: Math.random() }))
      ];
    case 'groupBy':
      return [
        Array.from({ length: size }, (_, i) => ({
          type: i % 2 === 0 ? 'even' : 'odd',
          category: i % 3 === 0 ? 'A' : (i % 3 === 1 ? 'B' : 'C'),
          details: {
            value: i,
            nested: {
              level: i % 5,
              items: Array.from({ length: (i % 5) + 1 }, (_, j) => ({
                id: j,
                value: Math.random()
              }))
            }
          },
          timestamp: Date.now() + i
        })),
        'type'
      ];
    case 'flattenDeep': {
      const nestedArray = (depth) => {
        let current = depth;
        let result = current;
        while (current > 0) {
          result = [current, result];
          current -= 1;
        }
        return result;
      };
      return [nestedArray(size)];
    }
    case 'uniq':
      return [
        Array.from({ length: size }, () => Math.floor(Math.random() * 10))
      ];
    case 'chunk':
      return [
        Array.from({ length: size }, (_, i) => i),
        Math.ceil(size / 10)
      ];
    case 'difference':
      return [
        Array.from({ length: size }, (_, i) => i),
        Array.from({ length: size / 2 }, (_, i) => i * 2)
      ];
    case 'flatten':
      return [
        Array.from({ length: size }, (_, i) => i % 2 === 0 ? [i, [i + 1]] : i)
      ];
    case 'sum':
      return [
        Array.from({ length: size }, () => Math.random() * 100)
      ];
    case 'range':
      return [
        0,
        size,
        Math.ceil(size / 10)
      ];
    case 'fill':
      return [
        Array.from({ length: size }, () => 0),
        Math.random() * 100,
        Math.floor(size / 4),
        Math.floor(size / 2)
      ];
    case 'reverse':
      return [
        Array.from({ length: size }, (_, i) => i)
      ];
    case 'filter':
      return [
        Array.from({ length: size }, (_, i) => ({
          value: i,
          isValid: i % 2 === 0
        })),
        item => item.isValid
      ];
    case 'reduce':
      return [
        Array.from({ length: size }, (_, i) => i),
        (acc, val) => acc + val,
        0
      ];
    default:
      return null; // Invalid command
  }
};

// Generic benchmark function to reduce code duplication
function benchmarkOperation(operation) {
  console.log(`Benchmarking ${operation}`);

  const sizes = [1000, 10000, 100000];
  let results = [];

  sizes.forEach(size => {
    const suite = new Benchmark.Suite;
    const [...args] = generateData(size, operation);

    // console.log(`Generated data for size ${size}:`, args);

    suite.add(`Lodash ${operation} ${size}`, {
      defer: true,
      fn: async (deferred) => {
        await _[operation](...args);
        deferred.resolve();
      }
    });
    suite.add(`Fasterdash ${operation} ${size}`, {
      defer: true,
      fn: async (deferred) => {
        await fasterdash[operation](...args);
        deferred.resolve();
      }
    });

    suite.on('cycle', (event) => {
      console.log(String(event.target));
      const size = parseInt(event.target.name.split(' ')[2]);
      const totalTime = event.target.stats.mean * event.target.stats.sample.length;
      results.push({ name: event.target.name, totalTime, size });
      console.log(`Total execution time for ${size} elements: ${totalTime.toFixed(3)} seconds`);
    });

    suite.on('complete', async () => {
      console.log(`All '${operation}' benchmarks completed.`);
      await generateGraph(results, operation);
    });

    suite.run({ 'async': true });
  });
}

// Function to generate and save a graph
async function generateGraph(data, operation) {
  const traceData = data.reduce((acc, d) => {
    const key = d.name.includes('Lodash') ? 'Lodash' : 'Fasterdash';
    acc[key].push({ size: d.size, totalTime: d.totalTime, name: d.name });
    return acc;
  }, { 'Lodash': [], 'Fasterdash': [] });



  const traces = Object.entries(traceData).map(([lib, values]) => {
    const sortedValues = values.sort((a, b) => a.size - b.size);

    return {
      x: values.map(v => v.size),
      y: values.map(v => v.totalTime),
      type: 'scatter',
      mode: 'lines+markers',
      name: `${lib} ${operation}`,
      marker: { color: lib === 'Lodash' ? 'blue' : 'red' },
      text: values.map(v => v.name),
      hoverinfo: 'x+y+text'
    }
  });

  const layout = {
    title: `Total Time of Lodash vs Fasterdash ${operation} across different array sizes`,
    xaxis: { title: 'Array Size', type: 'linear' },
    yaxis: { title: 'Total Time (seconds)', autorange: true },
    width: 800,
    height: 600
  };

  const html = `<html><head><script src="https://cdn.plot.ly/plotly-latest.min.js"></script></head>
                  <body><div id="myDiv" style="width: 800px; height: 600px;"></div>
                  <script>
                    var graphDiv = document.getElementById('myDiv');
                    Plotly.newPlot(graphDiv, ${JSON.stringify(traces)}, ${JSON.stringify(layout)});
                  </script></body></html>`;

  await htmlToImage({
    output: `./benchmark/results/${operation}.png`,
    html: html,
    puppeteerArgs: { args: ['--no-sandbox'] },
  });
}

// Entry point function using command line arguments
function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Please provide an operation to benchmark.');
    process.exit(1);
  }
  benchmarkOperation(args[0]);
}

main();
