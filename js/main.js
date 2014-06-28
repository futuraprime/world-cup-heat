(function($, _, d3) {
  var w = 400; var h = 800;
  var chart = d3.select('#interactive').append('svg');
  chart.attr('width', w)
    .attr('height', h);

  function getTransformString(x, y, css) {
    return 'translate('+(x || 0)+(css ? 'px' : '')+','+(y || 0)+(css ? 'px' : '')+')';
  }

  var xScale = d3.scale.linear()
    .range([100, w])
    .domain([0,3]);
  var yScale = d3.scale.ordinal()
    .domain(_.range(32))
    .rangePoints([0, h-20], 1);
  var colorScale = d3.scale.quantize()
    .domain([50,90])
    .range([
      '#77B479',
      '#337331',
      '#AD8536',
      '#8A6318',
      '#821B0D'
    ]);

  var line = d3.svg.line()
    .x(function(d) { return xScale(d.number); })
    .y(function(d) {
      console.log(d.weather.temperature, yScale(d.weather.temperature));
      return yScale(d.weather.temperature);
    });

  $.getJSON('data/teams.json', function(teams) {
    console.log(teams);
    var teamArray = _.values(teams);
    var allTeams = chart.selectAll('g.team')
      .data(teamArray).enter().append('g')
      .attr('class', 'team')
      .attr('transform', function(d, i) {
        return getTransformString(0, yScale(i));
      });

    var teamGroups = allTeams.selectAll('g.match')
      .data(function(d) { return d.matches; })
      .enter().append('g')
      .attr('class', 'match')
      .attr('transform', function(d) {
        return getTransformString(xScale(d.number -1), 0);
      });

    teamGroups.append('rect')
      .attr('x', 0)
      .attr('width', xScale(2) - xScale(1))
      .attr('height', yScale(2) - yScale(1))
      .attr('fill', function(d) { 
        return colorScale(d.weather.temperature);
        // return d3.hcl(colorScale(d.weather.temperature), 70, 40).toString();
      });

    teamGroups.append('text')
      .text(function(d) { return d.weather.temperature; })
      .attr('class', 'team-text')
      .attr('x', (xScale(2) - xScale(1)) / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle');
  });
}).call(this, jQuery, _, d3);
