/**
 * Created by kevin on 7/30/15.
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

/*d3.select("#canvas").selectAll("text")
 .data(dataset)
 .enter()
 .append("text")
 .text(function(d){return d+" <br/> ";} );*/
/*
 d3.csv("milcsmall.csv", function(data) {
 dataset = data.map(function(d) { return [ +d["max_i"], +d["min_i"] ]; });
 console.log(dataset)
 });
 */


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

