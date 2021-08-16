const margin = {top: 30, right: 20, bottom: 50, left: 60};
const width = 1200;
const height = 600;
const colorMen = '#F2C53D';
const colorWomen = '#A6BF4B';
const colorMenCircles = '#BF9B30';
const colorWomenCircles = '#718233';
const circlesRadius = 2.5;
const circlesPadding = 0.7;

// Load data here
d3.csv('./data/pay_by_gender_all.csv')
  .then(data => convertData(data))
  .then(data => createViz(data))

convertData = function (data) {
  const converted = data.map((d) => ({
    ...d,
    earnings_USD_2019: Number(d.earnings_USD_2019.replace(/,/g, ''))
  }));
  return converted
};


// Create Visualization
createViz = (data) => {
  console.log("createvis", data)
  // Create bins for each sport, men and women
  const sports = [ 'basketball', 'golf', 'tennis'];
  const genders = ['men', 'women'];
  const bins = [];

  sports.forEach(sport => {
    genders.forEach(gender => {
      const binsSet = {
        sport: sport,
        gender: gender,
        bins: d3.bin()(
          data
            .filter(d=> d.sport == sport)
            .filter(d => d.gender == gender)
            .map(d => d.earnings_USD_2019))
      };
      bins.push(binsSet);
    });
  });

  console.log("bins", bins)

  const binsMaxLength = d3.max(bins.map(bin => bin.bins), d => d.length);
  const xViolinWidth = 60;

  let xScale = d3.scaleLinear()
  .domain([0, binsMaxLength])
  .range([0, xViolinWidth]);

  let yScale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.earnings_USD_2019) + 5000000])
  .range([height - margin.bottom, margin.top])

  let violin = d3.select('#viz')
  .append('svg')
  .attr('viewbox', [0, 0, width, height])
  .attr('width', width)
  .attr('height', height);


  // Append container for the effect: defs
  const defs = violin.append('defs');

  // Add filter for the glow effect
  const filter = defs
    .append('filter')
        .attr('id', 'glow');
  filter
    .append('feGaussianBlur')
        .attr('stdDeviation', '3.5')
        .attr('result', 'coloredBlur');
  const feMerge = filter
    .append('feMerge');
  feMerge.append('feMergeNode')
    .attr('in', 'coloredBlur');
  feMerge.append('feMergeNode')
    .attr('in', 'SourceGraphic');

  const spaceBetweenSports = (width - margin.left - margin.right) / (sports.length + 1);

  // manually draw the x-axis line... why?? I dunno...
  violin
  .append('line')
    .attr('class', 'x-axis')
    .attr('x1', margin.left)
    .attr('x2', width - margin.right)
    .attr('y1', height - margin.bottom + 1)
    .attr('y2', height - margin.bottom + 1)
    .attr('stroke', 'black');

  // manually add the x-axis labels
  violin
    .selectAll('.x-axis-label')
    .data(sports)
    .join('text')
      .attr('x', (d, i) => margin.left + ((i + 1) * spaceBetweenSports))
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .text(d => d);


  const yAxis = violin
    .append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale.nice()));

  violin.append('text')
    .attr('x', 0)
    .attr('y', margin.top/2)
    .text('Earnings in 2019 (USD)')
    .attr('text-anchor', 'start')

  // goes right
  const areaGeneratorMen = d3.area()
    .x0(xViolinWidth)
    .x1(d => xViolinWidth + xScale(d.length))
    .y(d => yScale(d.x1))
    .curve(d3.curveCatmullRom);
  // goes left
  const areaGeneratorWomen = d3.area()
    .x0(d => xViolinWidth - xScale(d.length))
    .x1(xViolinWidth)
    .y(d => yScale(d.x1))
    .curve(d3.curveCatmullRom);

  violin
    .append('g')
      .attr('class', 'violins')
    .selectAll('.violin')
    .data(bins)
    .join('path')
      .attr('class', d => `violin violin-${d.sport} violin-${d.gender}`)
      .attr('d', d => d.gender === 'women' ? areaGeneratorWomen(d.bins) : areaGeneratorMen(d.bins))
      .attr('transform', d => {
        // translate each graph by it's sport to the right
        const index = sports.indexOf(d.sport) + 1;
        const translationX = index * spaceBetweenSports;
        return `translate(${translationX}, 0)`;
      })
      .attr('fill', d => d.gender === 'women' ? colorWomen : colorMen)
      .attr('fill-opacity', 0.8)
      .attr('stroke', 'none')
      .style("filter", "url(#glow)");

  const simulation = d3.forceSimulation(data)
    .force('forceX', d3.forceX(d => {
      const index = sports.indexOf(d.sport) + 1;
      return margin.left + (index * spaceBetweenSports);
    }).strength(0.1))
    .force('forceY', d3.forceY(d => yScale(d.earnings_USD_2019)).strength(10))
    .force('collide', d3.forceCollide(circlesRadius + circlesPadding))
    .force('axis', () => {
      data.forEach(datum => {
        const index = sports.indexOf(datum.sport) + 1;
        const translationX = margin.left + (index * spaceBetweenSports);

        // If men, move right of violin's centerline
        if (datum.gender === 'men' && datum.x < translationX) {
          datum.vx += 0.01 * datum.x;
        }

        // If women, move left of violin's centerline
        if (datum.gender === 'women' && datum.x > translationX) {
          datum.vx -= 0.01 * datum.x;
        }

        // Ensure that data doesn't go below the x axis
        if (datum.y > height - margin.bottom) {
          datum.vy -= 0.001 * datum.y;
        }
      })
    })
    .stop();


  const numIterations = 300;
  for (let i = 0; i < numIterations; i++) {
    simulation.tick();
  }

  simulation.stop();

  violin.append('g')
    .attr('class', 'data-circles')
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('cx', d=> d.x)
    .attr('cy', d=> d.y)
    .attr('r', circlesRadius)
    .style('fill', d => d.gender === 'women' ? colorWomenCircles : colorMenCircles)
    .style('fill-opacity', 0.6)
    .style('stroke', d => d.gender === 'women' ? colorWomenCircles : colorMenCircles);


  // add tooltip
  let tooltip = d3.select('.tooltip')

  handleMouseOver = function(event, d) {
    tooltip.select('.name')
      .text(d.name)
    tooltip.select('.home')
      .text(d.country)
    tooltip.select('.earnings')
      .text(d3.format('~s')(d.earnings_USD_2019))
    tooltip.style('top', `${event.pageY}px`)
    .style('left', `${event.pageX}px`)
    .classed('visible', true)
  }

  d3.selectAll('circle')
  .on('mouseover', (event, d) => {
     console.log(event, d);
     handleMouseOver(event, d)
  });


};