import Benchmark from 'benchmark';
import fs from 'fs';
import _ from 'lodash';
import htmlToImage from 'node-html-to-image';

// Extract the lodash orderBy function
const lodashOrderBy = _.orderBy;
const suite = new Benchmark.Suite;

// Example data generation function
const generateData = (size) => {
  return Array.from({ length: size }, (_, i) => ({
    id: i,
    value: Math.random()
  }));
};

// Array sizes to test
const sizes = [1000, 10000, 100000];
let results = [];

// Add benchmark tests for different array sizes
sizes.forEach(size => {
  suite.add(`Lodash orderBy ${size}`, () => {
    const data = generateData(size);
    lodashOrderBy(data, ['value']);
  });
});

// Event listener for each benchmark cycle (iteration)
suite.on('cycle', (event) => {
  console.log(String(event.target));
  // Extract size directly from the name of the test
  const size = parseInt(event.target.name.split(' ')[2]);
  // Calculate total time for the benchmark in seconds
  const totalTime = event.target.stats.mean * event.target.stats.sample.length;
  // Push the benchmark result into the results array
  results.push({
    name: event.target.name, // Name of the test
    totalTime: totalTime,    // Total time in seconds
    size: size               // Size of the array used in the test
  });
  console.log(`Total execution time for ${size} elements: ${totalTime.toFixed(3)} seconds`);
});

// Event listener for completion of all benchmarks
suite.on('complete', async function() {
  console.log('All benchmarks completed.');
  await generateGraph(results);
  console.log('Graph image has been saved.');
});

// Run the benchmark suite asynchronously
suite.run({ 'async': true });

// Function to generate a graph from the benchmark results and save it as a PNG image
async function generateGraph(data) {
  // Create a trace for Plotly
  const trace = {
    x: data.map(d => d.size), // Array sizes
    y: data.map(d => d.totalTime), // Total time for each array size
    type: 'scatter',
    mode: 'lines+markers',    // Line graph with markers at each data point
    marker: { color: 'blue' },
    text: data.map(d => d.name), // Add test names as hover text
    hoverinfo: 'x+y+text'    // Show size, total time, and test name on hover
  };

  // Layout for the Plotly graph
  const layout = {
    title: 'Total Time of lodash orderBy across different array sizes',
    xaxis: {
      title: 'Array Size',
      type: 'linear', // Logarithmic scale for the x-axis
      tickvals: data.map(d => d.size), // Explicit tick values for each array size
      ticktext: data.map(d => `${d.size}`) // Text labels for the tick values
    },
    yaxis: {
      title: 'Total Time (seconds)',
      autorange: true
    },
    width: 800, // Width of the graph
    height: 600 // Height of the graph
  };

  // HTML string to create the Plotly graph
  const html = `<html><head><script src="https://cdn.plot.ly/plotly-latest.min.js"></script></head>
                <body><div id="myDiv" style="width: 800px; height: 600px;"></div>
                <script>
                  var graphDiv = document.getElementById('myDiv');
                  Plotly.newPlot(graphDiv, [${JSON.stringify(trace)}], ${JSON.stringify(layout)});
                </script></body></html>`;

  // Convert the HTML to an image using node-html-to-image and save it
  await htmlToImage({
    output: './benchmark/output.png',
    html: html,
    puppeteerArgs: { args: ['--no-sandbox'] },
  });
}
