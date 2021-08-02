const topRockSongs = [
  { artist: "Fleetwod Mac", title: "Dreams", sales_and_streams: 1882000 },
  { artist: "AJR", title: "Bang!", sales_and_streams: 1627000 },
  { artist: "Imagine Dragons", title: "Believer", sales_and_streams: 1571000 },
  { artist: "Journey", title: "Don't Stop Believin'", sales_and_streams: 1497000 },
  { artist: "Eagles", title: "Hotel California", sales_and_streams: 1393000 }
];

const topSongsSection = d3.select('#top-songs')

topSongsSection
  .append('h3')
  .text('Top Rock Songs')

const circleChartWidth = 500;
const circleChartHeight = 130;

const circlesChart = topSongsSection
  .append('svg')
  .attr('viewbox', [0, 0, circleChartWidth, circleChartHeight])
  .attr('width', circleChartWidth)
  .attr('height', circleChartHeight);


circlesChart
    .append('line')
      .attr('x1', 0)
      .attr('y1', circleChartHeight/2)
      .attr('x2', circleChartWidth)
      .attr('y2', circleChartHeight/2)
      .attr('stroke', '#333')
      .attr('stroke-width', 2);

const circlesChartGroup = circlesChart.selectAll('g')
  .data(topRockSongs)
  .join('g')


const circlesScale = d3.scaleLinear()
  .domain([0, d3.max(topRockSongs, d => d.sales_and_streams)])
  .range([0, circleChartWidth - marginLeft - 100]);
const circleSpacer = 75;

circlesChartGroup
  .append('circle')
  .attr('r', d => circlesScale(d.sales_and_streams)/10)
  .attr('cx', (d, i) => (i+1) * circleSpacer)
  .attr('cy', circleChartHeight/2)
  .attr('fill', 'green')

circlesChartGroup
  .append('text')
  .attr('x', (d,i) => (i+1) * circleSpacer)
  .attr('y', circleChartHeight/2 - 25)
  .text(d => d.sales_and_streams / 100000 + 'M')
  .attr('text-anchor', 'middle')
  .attr('font-size', '10px')

circlesChartGroup
  .append('text')
  .attr('x', (d,i) => (i+1) * circleSpacer)
  .attr('y', circleChartHeight/2 + 35)
  .text(d => d.title)
  .attr('font-size', '8px')
  .attr('text-anchor', 'middle')