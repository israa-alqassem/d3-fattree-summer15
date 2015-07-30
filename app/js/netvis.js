/**
 * Created by kevin on 7/23/15.
 */

/*
d3.text("data/table.csv", function(datasetText) {

    var parsedCSV = d3.csv.parseRows(datasetText);

    var sampleHTML = d3.select("#canvas")
        .append("table")
        .style("border-collapse", "collapse")
        .style("border", "2px black solid")

        .selectAll("tr")
        .data(parsedCSV)
        .enter().append("tr")

        .selectAll("td")
        .data(function(d){return d;})
        .enter().append("td")
        .style("border", "1px black solid")
        .style("padding", "5px")
        .on("mouseover", function(){d3.select(this).style("background-color", "aliceblue")})
        .on("mouseout", function(){d3.select(this).style("background-color", "white")})
        .text(function(d){return d;})
        .style("font-size", "12px");
});

var sampleSVG = d3.select("#canvas")
    .append("svg")
    .attr("width", 100)
    .attr("height", 100);

sampleSVG.append("circle")
    .style("stroke", "gray")
    .style("fill", "white")
    .attr("r", 40)
    .attr("cx", 50)
    .attr("cy", 50)
    .on("mouseover", function(){d3.select(this).style("fill", "aliceblue");})
    .on("mouseout", function(){d3.select(this).style("fill", "white");});
*/


/*
 0:id,1:sx,2:sy,3:tx,4:ty,5:dup,6:data,7:dir,8:region
 0,526,0,29,1,0,0,0,1
 1,1212,0,68,1,0,0,0,1
 */
var dataset2 = [
    [0, 2, 1, 5, 2, 0, 10, 0, 1],
    [0, 2, 1, 5, 2, 0, 2, 1, 1],
    [0, 10, 1, 8, 2, 0, 5, 0, 1],
    [0, 10, 1, 8, 2, 0, 0, 1, 1],
    [0, 18, 1, 18, 2, 0, 7, 0, 1],
    [0, 18, 1, 18, 2, 0, 3, 1, 1],
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
    expression = "";

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
    yinner = tx % groupSize
    youter = Math.floor(sx/groupSize) * groupSize

    xinner = sx % groupSize
    xouter = (ty - 2) * groupSize

    

    newY = yinner + youter
    newX = xinner + xouter

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

/*
(x1, y1) -> (x2, y2), value
x = x1 % clusterSize

y_group = Math.floor(x1 / clusterSize)


y = (x2 % clusterSize) + (y_group * (clusterSize + clusterMargin))
 */

var linkMargin = 2;
var linkWidth = 20;                                              // with of link in pixels
var linkRadius = linkWidth/3;

var groupSize = 18;                                          // number of links to display horizontally
var clusterWidth = (linkWidth + linkMargin) * groupSize;
var clusterMargin = 10;
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
    .attr("width", clusterWidth)
    .attr("height", clusterWidth)
    .style("fill", "black")
    .style("stroke", "lightblue")

/*d3.select("#canvas").selectAll("text")
    .data(dataset)
    .enter()
    .append("text")
    .text(function(d){return d+" <br/> ";} );*/

display.append("g")
    .selectAll("d rect")
    .data(dataset2.filter(function (d){ return d[7] == 0;}))
    .enter()
    .append("rect")
    .attr("class","link")
    .attr("x", function(d) { return translateCoords(d[1], d[2], d[3], d[4])[0]; })
    //.attr("y", function(d) { var k = +!d[7]; return translateCoords(d[1], d[2], d[3], d[4])[1] + (k*linkWidth/2); })
    .attr("y", function(d) { return translateCoords(d[1], d[2], d[3], d[4])[1]; })
    .attr("width", linkWidth)
    .attr("height", linkWidth)
    //.attr("height", linkWidth/2)
    //.style("stroke", "lightblue")
    .style("fill", function(d) { return cmap(d[6]);});

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

/*
var margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = 600 - margin.left - margin.right,
    height = 270 - margin.top - margin.bottom;

var parseDate = d3.time.format("%d-%b-%y").parse;
var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(5);
var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(5);

var valueline = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.close); });

var svg = d3.select("#canvas")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.tsv("data/data.tsv", function(error, data) { data.forEach(function(d) {
    d.date = parseDate(d.date);
    d.close = +d.close;
});

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.close; })]);

    svg.append("path") // Add the valueline path.
        .attr("d", valueline(data));
    svg.append("g") // Add the X Axis .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")") .call(xAxis);
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
// Add the Y Axis
});
    */

