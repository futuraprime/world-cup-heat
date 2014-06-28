(function($, _, d3) {
  var w = 400; var h = 600;
  var chart = d3.select('#interactive').append('svg');
  chart.attr('width', w)
    .attr('height', h);

  var xScale = d3.scale.linear()
    .range([50, w-50])
    .domain([1,3]);
  var yScale = d3.scale.linear()
    .range([h-50, 50])
    .domain([40, 100]);

  var line = d3.svg.line()
    .x(function(d) { return xScale(d.number); })
    .y(function(d) {
      console.log(d.weather.temperature, yScale(d.weather.temperature));
      return yScale(d.weather.temperature);
    });

  $.getJSON('data/teams.json', function(teams) {
    console.log(teams);
    var teamArray = _.values(teams);
    var teamGroups = chart.selectAll('g.team')
      .data(teamArray).enter().append('g')
      .attr('class', 'team');

    teamGroups.append('path')
      .attr('d', function(d) {
        // console.log(d.matches);
        return line(d.matches);
      });
  });
}).call(this, jQuery, _, d3);
