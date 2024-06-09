import Benchmark from 'benchmark';
import fs from 'fs';
import _ from 'lodash';
import fasterdash from '../lib/index.js';
import htmlToImage from 'node-html-to-image';
import process from 'process';

// Common data generation function
const generateData = (size, mode) => {
  switch(mode) {
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
    default:
      return null; // Invalid command
  }
};

// Generic benchmark function to reduce code duplication
// E.g. operation could be 'orderBy' or 'compact'
function benchmarkOperation(operation) {
  console.log(`Benchmarking ${operation}`);

  const suite = new Benchmark.Suite;
  const sizes = [1000, 10000, 100000];
  let results = [];

  sizes.forEach(size => {
    const [...args] = generateData(size, operation);
    suite.add(`Lodash ${operation} ${size}`, () => {
      _[operation](...args);
    });
    suite.add(`Fasterdash ${operation} ${size}`, () => {
      fasterdash[operation](...args);
    });
  });

  suite.on('cycle', (event) => {
    console.log(String(event.target));
    const size = parseInt(event.target.name.split(' ')[2]);
    const totalTime = event.target.stats.mean * event.target.stats.sample.length;
    results.push({ name: event.target.name, totalTime, size });
    console.log(`Total execution time for ${size} elements: ${totalTime.toFixed(3)} seconds`);
  });

  suite.on('complete', async () => {
    console.log('All benchmarks completed.');
    await generateGraph(results, operation);
  });

  suite.run({ 'async': true });
}

// Function to generate and save a graph
async function generateGraph(data, operation) {
  const traceData = data.reduce((acc, d) => {
    const key = d.name.includes('Lodash') ? 'Lodash' : 'Fasterdash';
    acc[key].push({ size: d.size, totalTime: d.totalTime, name: d.name });
    return acc;
  }, { 'Lodash': [], 'Fasterdash': [] });

  const traces = Object.entries(traceData).map(([lib, values]) => ({
    x: values.map(v => v.size),
    y: values.map(v => v.totalTime),
    type: 'scatter',
    mode: 'lines+markers',
    name: `${lib} ${operation}`,
    marker: { color: lib === 'Lodash' ? 'blue' : 'red' },
    text: values.map(v => v.name),
    hoverinfo: 'x+y+text'
  }));

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
// E.g. args[0] could be 'orderBy' or 'compact'
function main() {
  const args = process.argv.slice(2);
  benchmarkOperation(args[0]);
}

main();
