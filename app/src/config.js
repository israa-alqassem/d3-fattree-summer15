/**
 * Created by yarden on 4/2/15.
 * Updated by kevin on 12/1/15.
 */
define(function(require) {

  var d3 = require('d3');

  var value_band = d3.scale.linear().rangeRound([8, 0]);
  var value_color = d3.scale.ordinal().domain([0, 8]).range(colorbrewer.YlOrRd[9]);
  var scale = d3.scale.quantize().range(colorbrewer.YlOrRd[9]);
  var JOBS_COLORMAP = colorbrewer.Set1[8].concat();
  var VALUES_COLORMAP = colorbrewer.YlOrRd[9];

  var colorSet = {
    1: colorbrewer.YlOrRd[9],
    2: colorbrewer.Reds[9],
    3: colorbrewer.Oranges[9],
    4: colorbrewer.Spectral[9],
    5: colorbrewer.Pastel1[9],
    6: colorbrewer.Set3[9]
  };
  var colorId = 1;

  return {
    MULTI_JOBS_COLOR: '#00ffff',
    UNKNOWN_JOB_COLOR: '#a0a0a0',
    VALUES_COLORMAP: VALUES_COLORMAP,

    jobColor: function(id) {
      id = Math.min(id, JOBS_COLORMAP.length-1);
      return JOBS_COLORMAP[id];
    },

    data_range: function(range) {
      if (!arguments.length) return scale.domain();
      return scale.domain(range);
    },

    color: function (v) {
      return scale(v);
    },

    change_color: function(){
      colorId = colorId + 1;
      if (colorId === 7){
        colorId = 1;
      }

      scale.range(colorSet[colorId]);

      this.VALUES_COLORMAP = colorSet[colorId];
    },

    color2: d3.scale.linear()
      .range(['#ff0000', '#00ff00'])
      .interpolate(d3.interpolateHcl)
  }
});
