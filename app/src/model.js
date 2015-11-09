/**
 * Created by kevin on 15/10/30.
 */

define(function(require){

    // private variables
    var d3 = require('d3');

    var consumer;
    var model = {};
    var _dataset, nodedata, switchdata = [];

    var setup;
    var filterTrafficDir;
    var updateLinks, updateNodes;

    setup = function(){
        nodedata = switchdata = [];
        model.applyDataFilters([['trafdir', 'up']]);
    };

    filterTrafficDir = function(val){
        if (typeof(val)==='undefined') val = 'up';

        var dir = 0;

        if(val === 'up'){
            dir = 0;
        } else if(val === 'down'){
            dir = 1;
        }

        if(val === 'bi'){
            switchdata = _dataset.filter(function (d) {
                return (d.sy > 0);
            });
            nodedata = _dataset.filter(function (d) {
                return (d.sy === 0);
            });
        } else {
            switchdata = _dataset.filter(function (d) {
                return ((d.dir === dir) && (d.sy > 0));
            });
            nodedata = _dataset.filter(function (d) {
                return ((d.dir === dir) && (d.sy === 0));
            });
        }

        consumer.consume({switch: switchdata, node: nodedata});
    };

    model.applyDataFilters = function(filter){
        if (typeof(filter)==='undefined') filter = [];

        var i = 0;

        for(i = 0; i < filter.length; i++){
            switch (filter[i][0]){
                case 'trafdir':
                    filterTrafficDir(filter[i][1]);
                    break;

                default:
                    console.log("Unrecognised filter: " + filter[i][0]);
            }
        }

        console.log('Trigger update: applyDataFilters');
    };

    model.loadData = function (filename) {
            d3.csv(filename, function (error, data) {
                var count = 0;
                data.forEach(function (d) {
                    d.sx = +d.sx;
                    d.sy = +d.sy;
                    d.tx = +d.tx;
                    d.ty = +d.ty;
                    d.dir = +d.dir;
                    d.data = +d.data;
                    count = count + 1;
                });

                _dataset = data;

                setup();
            });
    };

    model.addConsumer = function(object){
            consumer = object;
    };

    return model;

});