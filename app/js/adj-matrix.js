/**
 * Created by kevin on 8/5/15.
 */

var linkMatrix = (function(){
    var dataset;
    var location;

    // Layout specification variables
    var linkMargin = 0;
    var linkWidth = 10;                                         // width of link in pixels
    var linkRadius = linkWidth/3;                               // for square with rounded corners

    var groupSize = 18;                                         // number of links to display horizontally/vertically per group
    var clusterWidth = (linkWidth + linkMargin) * groupSize;    // width of cluster (group) in pixels
    var clusterMargin = 15;
    var displayPadding = 10;

    var cmap;

    // D3 object variables
    var canvas;

    // Private Methods
    var showSquaresLink, showTriangleLinks;
    var translateCoords;
    var drawTriangle;

    translateCoords = function (sx, sy, tx, ty){
        var yinner = tx % groupSize;
        var youter = Math.floor(sx/groupSize) * groupSize;

        var xinner = sx % groupSize;
        var xouter = (ty - 2) * groupSize;

        // Flip along the diagonal for items in side groups, and choose correct side
        if (sy % 2 === 0){
            tmp = yinner;
            yinner = xinner;
            xinner = tmp;

            var subgroup = Math.floor(tx/groupSize);
            if ((subgroup % 2) === 1 ){
                xouter = xouter + ( groupSize)
            }
        }

        // get position in display
        var newY = yinner + youter;
        var newX = xinner + xouter + groupSize;

        // add column and link margins/padding
        newX = (newX * (linkWidth+linkMargin)) + Math.floor((xouter/groupSize) * clusterMargin);
        newY = (newY * (linkWidth+linkMargin)) + Math.floor((youter/groupSize) * clusterMargin);
        return [ newX+ 20, newY + 10 ]
    };

    canvas = d3.select("#canvas")
        .append("svg")
        .attr("width", clusterWidth * 6)
        .attr("height", clusterWidth * 5);

    showSquaresLink = function(){
        // TODO: this block can be removed
        canvas.append("g")
            .append("rect")
            .attr("x", clusterWidth + 20)
            .attr("y",  displayPadding)
            .attr("width", clusterWidth)
            .attr("height", clusterWidth)
            .style("fill", "lightblue")
            .style("stroke", "lightblue");

        canvas.append("g")
            .selectAll("d rect")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("class","link")
            .attr("x", function(d) { return translateCoords(d.sx, d.sy, d.tx, d.ty)[0]; })
            //.attr("y", function(d) { var k = +!d.dir; return translateCoords(d.sx, d.sy, d.tx, d.ty)[1] + (k*linkWidth/2); })
            .attr("y", function(d) { return translateCoords(d.sx, d.sy, d.tx, d.ty)[1]; })
            .attr("width", linkWidth)
            .attr("height", linkWidth)
            //.attr("ry", linkRadius)
            .style("stroke", "black")
            .style("fill", function(d) { return cmap(d.data); });
    };

    return {

        showLinks : function(){
            if (dataset){
                showSquaresLink();
            }
        },

        updateLinks: function(data){

            // Find max value and map values over colour range
            var max = d3.max(data, function(d) { return d.data; });
            console.log("max data: " + max);
            cmap = d3.scale.linear().domain([0,  max]).range(["white", "red"]);

            dataset = data;
            this.showLinks();
        }


    }

})();

var loadButton = d3.select("#load")

d3.csv("../data/milc.csv", function(error, data) {
    var count = 0;
    data.forEach(function(d) {
        d.sx = +d.sx;
        d.sy = +d.sy;
        d.tx = +d.tx;
        d.ty = +d.ty;
        d.dir = +d.dir;
        d.data = +d.data;
        count = count + 1;
    });

    // remove compute node-connect links
    // TODO: NOTE: I am temporarily removing "up" traffic (links)
    data = data.filter(function (d){ return ((d.dir === 1) && (d.sy > 0)) ;});

    linkMatrix.updateLinks(data);
    linkMatrix.showLinks();
});



// python -m SimpleHTTPServer 8000