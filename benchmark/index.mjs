import Benchmark from 'benchmark';
import _ from 'lodash';
import fasterdash from '../index.js';
import htmlToImage from 'node-html-to-image';
import process from 'process';

const generateData = (size, mode) => {
  switch (mode) {
    case 'compact':
      return [
        Array.from({ length: size }, (_, i) => (i % 10 === 0 ? 0 : i))
      ];
    default:
      return null; // Invalid command
  }
};

// Generic benchmark function to reduce code duplication
function benchmarkOperation(operation) {
  console.log(`Benchmarking ${operation}...`);

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
      const sortedResults = results.sort((a, b) => {
        if(a.name.includes('Fasterdash') && !b.name.includes('Fasterdash')) {
          return -1;
        } else if(!a.name.includes('Fasterdash') && b.name.includes('Fasterdash')) {
          return 1;
        } else {
          return a.size - b.size
        }
      });
      console.log(`Results: ${JSON.stringify(sortedResults, null, 2)}`)
      await generateGraph(sortedResults, operation);
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
