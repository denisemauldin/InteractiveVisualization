const margin = {top: 30, right: 20, bottom: 50, left: 60};
const width = 1200;
const height = 600;
const padding = 1;
const color = 'steelblue';

d3.csv('./data/pay_by_gender_tennis.csv')
  .then(data => convertData(data))
  .then(data => createHistogram(data[0], data[1]))

convertData = function (data) {
  console.log("convertdata", data);
  let values = data.reduce((results, entry) => {
    results.push(Number(entry.earnings_USD_2019.replace(/,/g, '')));
    return results
  }, []);
  return [data, values]
};

createHistogram = function (data, wages) {
  console.log("histogram data", data)
  console.log("histogram wage", wages)
  let bin = d3.bin()
  let buckets = bin(wages)
  console.log("buckets", buckets)

  let xScale = d3.scaleLinear()
    //.domain([d3.min(wages), d3.max(wages)])
    .domain([buckets[0].x0, buckets[buckets.length - 1].x1])
    .range([margin.left, width - margin.right])

  let yScale = d3.scaleLinear()
    .domain([0, d3.max(buckets, d=> d.length)])
    .range([height - margin.top - margin.bottom, margin.top])


  let histogram = d3.select('#viz')
    .append('svg')
      .attr('viewbox', [0, 0, width, height])
      .attr('width', width)
      .attr('height', height)

  histogram.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${height - margin.bottom - margin.top})`)
    .call(d3.axisBottom(xScale))

  histogram.append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale))

  histogram.append('text')
    .attr('text-anchor', 'end')
    .attr('x', xScale(d3.max(wages)))
    .attr('y', height - margin.bottom/2)
    .text('Earnings in 2019 (USD)')

  histogram.append('g')
    .attr('class', 'bar-group')
    .attr('fill', color)
    .selectAll('.bars')
    .data(buckets)
    .join('rect')
    .attr('class', 'bars')
    .attr('x', d => xScale(d.x0) + padding)
    .attr('y', d => yScale(d.length))
    .attr('width', d => xScale(d.x1) - xScale(d.x0) - padding)
    .attr('height', d => yScale(0) - yScale(d.length))


  let lineGenerator = d3.line()
    .x(d => xScale(d.x0) + margin.left)
    .y(d => yScale(d.length))
    .curve(d3.curveCatmullRom)

  histogram.append('path')
    .attr('d', lineGenerator(buckets))
    .attr('fill', 'none')
    .attr('stroke', 'magenta')
    .attr('stroke-width', 2)

  let areaGenerator = d3.area()
    .x(d => xScale(d.x0) + margin.left)
    .y0(height - margin.bottom)
    .y1(d => yScale(d.length))
    .curve(d3.curveCatmullRom)

  histogram.append('path')
    .attr('class', 'area')
    .attr('d', areaGenerator(buckets))
    .attr('fill', 'yellow')
    .attr('fill-opacity', 0.4)
    .attr('stroke', 'none')
}
