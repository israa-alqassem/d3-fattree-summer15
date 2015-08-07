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

    // Display object variables
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
    }

    canvas = d3.select("#canvas")
        .append("svg")
        .attr("width", clusterWidth * 6)
        .attr("height", clusterWidth * 5);

    showSquaresLink = function(data){
        display.append("g")
            .selectAll("d rect")
            .data(data)
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


})();