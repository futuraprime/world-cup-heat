(function($, _, d3) {
  var w = 350; var h = 800;
  var chart = d3.select('#interactive').append('svg');
  chart.attr('width', w)
    .attr('height', h);

  function getTransformString(x, y, css) {
    return 'translate('+(x || 0)+(css ? 'px' : '')+','+(y || 0)+(css ? 'px' : '')+')';
  }

  var xScale = d3.scale.linear()
    .range([50, w])
    .domain([0,3]);
  var yScale = d3.scale.ordinal()
    .domain(_.range(32))
    .rangePoints([10, h-10]);
  var colorScale = d3.scale.quantize()
    .domain([55,85])
    .range([
      '#A8D4A1',
      '#77B479',
      '#509453',
      '#B13631',
      '#821B0D'
    ]);

  var line = d3.svg.line()
    .x(function(d) { return xScale(d.number); })
    .y(function(d) {
      return yScale(d.weather.temperature);
    });

  var textOffset = 16;

  $.getJSON('data/teams.json', function(teams) {
    console.log(teams);
    var teamArray = _.values(teams);
    var allTeams = chart.selectAll('g.team')
      .data(teamArray).enter().append('g')
      .attr('class', 'team')
      .attr('transform', function(d, i) {
        return getTransformString(0, yScale(i));
      });

    allTeams.append('text')
      .text(function(d) { return d.code; })
      .attr('text-anchor', 'end')
      .attr('x', xScale(0) - 5)
      .attr('y', textOffset + 2)
      .attr('title', function(d) { return d.country; })
      .attr('class', 'team-label');

    var teamGroups = allTeams.selectAll('g.match')
      .data(function(d) { return d.matches; })
      .enter().append('g')
      .attr('class', 'match')
      .attr('transform', function(d) {
        return getTransformString(xScale(d.number -1), 0);
      })
      .on('mouseenter', setActiveLocation)
      .on('touchstart', setActiveLocation)
      .on('mouseleave', clearActiveLocation)
      .on('touchend', clearActiveLocation);

    teamGroups.append('rect')
      .attr('x', 0)
      .attr('width', xScale(2) - xScale(1) - 1)
      .attr('height', yScale(2) - yScale(1) - 1)
      .attr('class', 'team-rect')
      .attr('stroke-width', 0)
      .attr('fill', function(d) {
        return colorScale(d.weather.temperature);
      });

    teamGroups.append('text')
      .text(function(d) { return d.weather.temperature; })
      .attr('class', 'team-text')
      .attr('x', (xScale(2) - xScale(1)) / 2)
      .attr('y', textOffset)
      .attr('text-anchor', 'middle');

    function reSort(comparator) {
      chart.selectAll('g.team')
        .sort(comparator)
        .transition(500)
        .attr('transform', function(d, i) {
          return getTransformString(0, yScale(i));
        });
    }

    $('#sort_heat').click(function() {
      function comparator(a, b) {
        return b.average_temps - a.average_temps;
      }
      reSort(comparator);
    });
    var groups = "ABCDEFGH".split('');
    $('#sort_group').click(function() {
      function comparator(a, b) {
        return groups.indexOf(a.group) * 10 + a.group_position - (groups.indexOf(b.group) * 10 + b.group_position);
      }
      reSort(comparator);
    });
    $('#sort_differential').click(function() {
      function comparator(a, b) {
        return b.goal_difference - a.goal_difference || b.goals_for - a.goals_for || b.goals_against - a.goals_against;
      }
      reSort(comparator);
    });

    function setActiveLocation(match) {
      teamGroups
        .transition(200)
        .attr('opacity', function(d) {
          return d.location === match.location ? 1 : 0.5;
        }).select('rect')
        .attr('stroke-width', function(d) {
          return d.match_number === match.match_number ? 2 : 0;
        });

    }
    function clearActiveLocation() {
      teamGroups
      .transition(200)
      .attr('opacity', 1);
    teamGroups.select('rect')
      .attr('stroke-width', 0);
    }
  });
}).call(this, jQuery, _, d3);
