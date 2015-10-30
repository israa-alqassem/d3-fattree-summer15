/**
 * Created by kevin on 15/10/30.
 */

define(function(require){

    // private variables
    var d3 = require('d3');
    var consumer;

    var model = {};

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

                consumer.consume(data);
            });
    };

    model.addConsumer = function(object){
            consumer = object;
    };

    return model;

});