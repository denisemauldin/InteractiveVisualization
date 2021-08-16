const margin = {
  top: 40,
  right: 0,
  bottom: 60,
  left: 40
};
const bubbleWidth = 1160;
const bubbleHeight = 380;
const metrics = ['total_album_consumption_millions', 'album_sales_millions', 'song_sales', 'on_demand_audio_streams_millions', 'on_demand_video_streams_millions'];
const artists = [];

d3.csv('../data/top_albums.csv')
  .then(data => convertData(data))
  .then(data => createBubbleChart(data));

convertData = function (data) {
  data.forEach(datum => {
    metrics.forEach(metric => {
      datum[metric] = parseFloat(datum[metric]); // Convert strings to numbers
    });
    artists.push(datum.artist); // Populate the artists array
  });
  return data
}

createBubbleChart = function (data) {
  console.log(data)
  const bubbleChart = d3.select("#bubble-chart")
    .append('svg')
    .attr('viewbox', [0, 0, bubbleWidth, bubbleHeight])
    .attr('width', bubbleWidth)
    .attr('height', bubbleHeight);

  const audioStreamsScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.on_demand_audio_streams_millions)])
    .range([margin.left, bubbleWidth - margin.left - margin.right])

  const xAxisG = bubbleChart
    .append('g')

  xAxisG
    .attr('transform', `translate(0, ${bubbleHeight - margin.bottom - margin.top})`)
    .call(d3.axisBottom(audioStreamsScale));

  bubbleChart
    .append('g')
    .append('text')
    .text('On-demand Audio Streams (millions)')
    .attr('x', bubbleWidth / 2)
    .attr('y', bubbleHeight - margin.bottom / 2)
    .attr('text-anchor', 'middle')

  const videoStreamsScale = d3.scaleLinear()
    .domain([d3.max(data, d => d.on_demand_video_streams_millions), 0])
    .range([0, (bubbleHeight - margin.top * 2 - margin.bottom)])

  const yAxisG = bubbleChart
    .append('g')

  yAxisG
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .call(d3.axisLeft(videoStreamsScale));

  bubbleChart
    .append('g')
    .append('text')
    .text('On-demand Video Streams (millions)')
    .attr('x', 0)
    .attr('y', margin.top / 2)
    .attr('text-anchor', 'start')

  const bubblesAreaScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.album_sales_millions)])
    .range([0, 50])

  const colorScale = d3.scaleOrdinal()
    .domain(artists)
    .range(d3.schemeTableau10);

  bubbleChart
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('cx', d => audioStreamsScale(d.on_demand_audio_streams_millions))
    .attr('cy', d => videoStreamsScale(d.on_demand_video_streams_millions))
    .attr('r', d => bubblesAreaScale(d.album_sales_millions))
    .attr('fill', d => colorScale(d.artist))

  // LEGEND

  var colorLegend = d3.select('.legend-color').append('ul')

  var rows = colorLegend
    .selectAll('li')
    .data(data)
    .join('li')

  rows
    .append('span')
    .attr('class', 'legend-circle')
    .style('background-color', d => colorScale(d.artist))
  rows
    .append('text')
    .text(d => `${d.title}, ${d.artist}`)

  // SIZING
  var sizeLegend = d3.select('.legend-area')
    .append('svg')
    .attr('viewbox', [0, 0, bubbleWidth, bubbleHeight])
    .attr('width', 200)
    .attr('height', 200);

  sizeLegend
    .append('circle')
    .attr('r', d => bubblesAreaScale(0.1))
    .attr('cx', 75)
    .attr('cy', 75)
    .attr('fill', '#727a87')
    .style('opacity', '0.4')

  sizeLegend
    .append('line')
    .attr('x1', 80)
    .attr('y1', 75)
    .attr('x2', 150)
    .attr('y2', 75)
    .attr('stroke', '#333')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', 6);

  sizeLegend
    .append('text')
    .text('0.1M')
    .attr('x', 160)
    .attr('y', 75)

  sizeLegend
    .append('circle')
    .attr('r', d => bubblesAreaScale(0.5))
    .attr('cx', 75)
    .attr('cy', 75)
    .attr('fill', '#727a87')
    .style('opacity', '0.4')


  sizeLegend
    .append('line')
    .attr('x1', 80)
    .attr('y1', 55)
    .attr('x2', 150)
    .attr('y2', 55)
    .attr('stroke', '#333')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', 6);

  sizeLegend
    .append('text')
    .text('0.5M')
    .attr('x', 160)
    .attr('y', 55)

  sizeLegend
    .append('circle')
    .attr('r', d => bubblesAreaScale(1.5))
    .attr('cx', 75)
    .attr('cy', 75)
    .attr('fill', '#727a87')
    .style('opacity', '0.4')

  sizeLegend
    .append('line')
    .attr('x1', 80)
    .attr('y1', 15)
    .attr('x2', 150)
    .attr('y2', 15)
    .attr('stroke', '#333')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', 6);

  sizeLegend
    .append('text')
    .text('1.5M')
    .attr('x', 160)
    .attr('y', 15)

}