/**
 * Created by kevin on 7/23/15.
 */

/*
 0:id,1:sx,2:sy,3:tx,4:ty,5:dup,6:data,7:dir,8:region
 0,526,0,29,1,0,0,0,1
 1,1212,0,68,1,0,0,0,1
 */


/*
    S-starting point
 ********S
 *  1   **
 *    *  *
 *  * 0  *
 *********


 */
function getTriangleLink(i, j, k){
    var expression = "";

    expression += "M " + (i + linkWidth) + " " + j;
    if (k == 0){
        expression += " L " +  (i + linkWidth) + " " + (j + linkWidth);
    } else{
        expression += " L " +  i + " " + j;
    }
    expression += " L " + i + " " + (j + linkWidth);
    return expression;
}

function translateCoords(sx, sy, tx, ty){
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

var linkMargin = 0;
var linkWidth = 10;                                              // with of link in pixels
var linkRadius = linkWidth/3;

var groupSize = 18;                                          // number of links to display horizontally
var clusterWidth = (linkWidth + linkMargin) * groupSize;
var clusterMargin = 15;
var displayPadding = 10;
var dataset = [];                           //Initialize empty array



//var cmap = d3.scale.linear().domain([0,  10]).range(["lightblue", "red"]);

var display = d3.select("#canvas")
    .append("svg")
    .attr("width", clusterWidth * 6)
    .attr("height", clusterWidth * 5);

display.append("g")
    .append("rect")
    .attr("x", clusterWidth + 20)
    .attr("y",  displayPadding)
    .attr("width", clusterWidth)
    .attr("height", clusterWidth)
    .style("fill", "lightblue")
    .style("stroke", "lightblue");


display.append("g")
    .append("rect")
    .attr("x", clusterWidth + 20)
    .attr("y", (clusterWidth+clusterMargin) + displayPadding)
    .attr("width", clusterWidth)
    .attr("height", clusterWidth)
    .style("fill", "lightblue")
    .style("stroke", "lightblue");


d3.csv("../data/milc.csv", function(error, dataset3) {
    console.log(dataset3[3]);
    var count = 0;
    dataset3.forEach(function(d) {
        d.sx = +d.sx;
        d.sy = +d.sy;
        d.tx = +d.tx;
        d.ty = +d.ty;
        d.dir = +d.dir;
        d.data = +d.data;
        count = count + 1;
    });

    dataset3 = dataset3.filter(function (d){ return ((d.dir === 1) && (d.sy > 0)) ;});

    var max = d3.max(dataset3, function(d) { return d.data; });
    console.log("max data: " + max);
    var cmap = d3.scale.linear().domain([0,  max]).range(["white", "red"]);

    display.append("g")
        .selectAll("d rect")
        .data(dataset3)
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
});

var display2 = d3.select("#canvas1")
    .append("svg")
    .attr("width", clusterWidth + 10)
    .attr("height", clusterWidth * 5);

display2.append("g")
    .append("rect")
    .attr("width", clusterWidth)
    .attr("height", clusterWidth)
    .style("fill", "black")
    .style("stroke", "lightblue");

display2.append("g")
    .selectAll("d path")
    .data(dataset)
    .enter()
    .append("path")
    .attr("class","link")
    .attr("d", function(d) { coords = mapCoords(d[0], d[1]);
        return getTriangleLink(coords[0], coords[1], d[2])})
    //.attr("width", linkWidth)
    //.attr("height", linkWidth/2)
    .style("fill", function(d) { return cmap(d[3]);});
