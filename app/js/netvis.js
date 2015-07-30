/**
 * Created by kevin on 7/23/15.
 */

/*
 0:id,1:sx,2:sy,3:tx,4:ty,5:dup,6:data,7:dir,8:region
 0,526,0,29,1,0,0,0,1
 1,1212,0,68,1,0,0,0,1
 */
var dataset2 = [
    [0, 2, 0, 5, 1, 0, 10, 0, 1],
    [0, 2, 1, 5, 2, 0, 10, 0, 1],
    [0, 2, 1, 5, 2, 0, 2, 1, 1],
    [0, 10, 1, 8, 2, 0, 5, 0, 1],
    [0, 10, 1, 8, 2, 0, 0, 1, 1],
    [0, 30, 1, 18, 2, 0, 7, 0, 1],
    [0, 30, 1, 18, 2, 0, 3, 1, 1],
    [0, 10, 2, 20, 3, 0, 7, 0, 1],
    [0, 1, 2, 17, 3, 0, 7, 0, 1],
    [0, 1, 2, 17, 3, 0, 3, 1, 1]
];

function generateMatrix(dim){
    matrix = [];
    for (var i = 0; i < dim; i++) {           //Loop 18 times
        for (var j = 0; j < dim; j++) {           //Loop 18 times
            for (var k = 0; k < 2; k++) {           //Loop 2 to generate bi-directional vals
                var x = Math.random();
                matrix.push([i, j, k, x]);             //Add new number to array
            }
        }
    }
    return matrix;
}

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
            xouter = xouter - (2 * groupSize)
        }
    }

    var newY = yinner + youter;
    var newX = xinner + xouter + groupSize;

    return [padX(newX), padY(newY)]
}

/* These should really be grouped, but I separate them in hopes of better performance. */
function mapCoords(x ,y){
    //var newX = x * (linkWidth+linkMargin);
    //var newY = y * (linkWidth+linkMargin);

    //var yGroup = Math.floor(x / clusterWidth);
    var newX = x % clusterWidth;
    var newY = y; //(y % clusterWidth)  + (yGroup * (clusterWidth);

    return [translateXCoord(newX), translateYCoord(newY)];
}
function padX(x){
    return x * (linkWidth+linkMargin);
}
function padY(y){
    return y * (linkWidth+linkMargin) + (Math.floor(y/clusterWidth) * clusterMargin);
}

var linkMargin = 2;
var linkWidth = 10;                                              // with of link in pixels
var linkRadius = linkWidth/3;

var groupSize = 18;                                          // number of links to display horizontally
var clusterWidth = (linkWidth + linkMargin) * groupSize;
var clusterMargin = 20;
var dataset = [];                           //Initialize empty array

for (var g = 0; g < 4; g++){
    var dataset_ = generateMatrix(groupSize);
    for (var i = 0; i < dataset_.length; i++){
        item = dataset_[i];
        dataset.push([item[0]+(groupSize*g), 1, item[1]+(groupSize*g), 2, item[2], item[3]]);
    }
}


var cmap = d3.scale.linear().domain([0,  10]).range(["white", "red"]);


var display = d3.select("#canvas")
    .append("svg")
    .attr("width", clusterWidth * 4)
    .attr("height", clusterWidth * 5);

display.append("g")
    .append("rect")
    .attr("x", clusterWidth)
    .attr("width", clusterWidth)
    .attr("height", clusterWidth)
    .style("fill", "lightblue")
    .style("stroke", "lightblue");



d3.csv("../data/milc.csv", function(error, dataset3) {
    console.log(dataset3[3]);
    dataset3.forEach(function(d) {
        d.sx = +d.sx;
        d.sy = +d.sy;
        d.tx = +d.tx;
        d.ty = +d.ty;
        d.dir = +d.dir;
        d.data = +d.data;
    });
    var max = d3.max(dataset3, function(d) { return d.data; });

    cmap = d3.scale.linear().domain([0,  max]).range(["white", "red"]);

    display.append("g")
        .selectAll("d rect")
        .data(dataset3.filter(function (d){ return ((d.dir === 1) && (d.sy > 0)) ;}))
        .enter()
        .append("rect")
        .attr("class","link")
        .attr("x", function(d) { return translateCoords(d.sx, d.sy, d.tx, d.ty)[0]; })
        //.attr("y", function(d) { var k = +!d[7]; return translateCoords(d[1], d[2], d[3], d[4])[1] + (k*linkWidth/2); })
        .attr("y", function(d) { return translateCoords(d.sx, d.sy, d.tx, d.ty)[1]; })
        .attr("width", linkWidth)
        .attr("height", linkWidth)
        //.attr("height", linkWidth/2)
        .style("stroke", "lightblue")
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
