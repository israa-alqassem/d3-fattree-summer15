/**
 * Created by kevin on 8/5/15.
 */

function formatBytes(bytes) {
    if(bytes < 1024) return bytes + " B";
    else if(bytes < 1048576) return(bytes / 1024).toFixed(3) + " KB";
    else if(bytes < 1073741824) return(bytes / 1048576).toFixed(3) + " MB";
    else return(bytes / 1073741824).toFixed(3) + " GB";
}

var logger = function() { return console.log("log")};

/*
TODO:
    - Move Controls to different file
 */
var Controls = (function(){
    var loadButton = d3.select("#button-load");

    return{
        addLoadAction : function(action){
            loadButton.on("click", action );
        }
    }
})();

var LinkMatrix = (function(){
    var dataset;
    var location;

    // Layout specification variables
    var linkMargin = 0;
    var linkWidth = 10;                                         // width of link in pixels
    var linkWidth_t = linkWidth + linkMargin;
    var linkRadius = linkWidth/3;                               // for square with rounded corners
    var maxLevel;

    var groupSizeX = 18;                                         // number of links to display horizontally/vertically per group
    var groupSizeY = [18, 36];                       // number of links to display vertically per group. Applicable to only levels 1 and 3 targets
    var clusterWidth = linkWidth_t * 18;           // width of cluster (group) in pixels TODO: replace constant with variable
    var clusterMargin = 15;
    var displayPadding = 10;

    var cmap;

    // D3 object variables
    var canvas;

    // Private Methods
    var showSquaresLink, showTriangleLinks, showInfoTip, hideInfoTip;
    var translateCoords;
    var drawTriangle;

    var infotipDiv = d3.select("#canvas").append("div")
        .attr("class", "infotip")
        .style("opacity", 0);

    // TODO: replace all the magic with a more robust translation technique
    translateCoords = function (sx, sy, tx, ty){
        // Always plot links with source (sx, sy) along the X axis.
        // Eg1: for HCA (level 0) to edge switches (level 1), (sx, sy) = HCA and (tx, ty) = level1 switch
        // Eg2: for edge switches (level 1) to level 2 switches, (sx, sy) = level 1 and (tx, ty) = level2 switch
        var i;

        if (sy % 2 === 1){
            var tmp = [tx, ty];
            tx = sx;
            ty = sy;
            sx = tmp[0];
            sy = tmp[1];
        }

        // find position of containing cluster, position within cluster
        var xCluster = Math.floor(sx/groupSizeX);
        var xinner = sx % groupSizeX;
        var xouter = xCluster * groupSizeX;

        var yCluster = Math.floor(ty/2);
        var yinner = tx % groupSizeY[Math.floor(ty/2)];
        var youter = 0;
        for (i = 0; i < yCluster; i++){
            youter = youter + groupSizeY[i];
        }

        // get position in display
        var newY = yinner + youter;
        var newX = xinner + xouter + groupSizeX;

        // add link margins/padding
        newX = newX * linkWidth_t;
        newY = newY * linkWidth_t;

        // add cluster margins/padding
        newX =  newX + (xCluster * clusterMargin);
        newY =  newY + (yCluster * clusterMargin);

        // flip image along the horizontal
        var vizHeight = 0;
        for (i = 0; i < groupSizeY.length; i++){
            vizHeight = vizHeight + (groupSizeY[i] * linkWidth_t) + clusterMargin;
        }
        newY = vizHeight  - newY;

        return [ newX, newY ]
    };

    canvas = d3.select("#canvas")
        .append("svg")
        .attr("width", clusterWidth * 6)
        .attr("height", clusterWidth * 5);

    showSquaresLink = function(){
        //d3.select("#canvas")
        //    .attr("width", function(){ return (clusterWidth * 4) + "px";});

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
            .attr("id","adjMatrix")
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
            .style("fill", function(d) { return cmap(d.data); })
            .on("mouseover", function(d){ showInfoTip(d); })
            .on("mouseout", function(d) { hideInfoTip(); });
    };

    showInfoTip = function(d){
        infotipDiv.transition()
            .duration(500)
            .style("opacity", .9);
        infotipDiv.html(d.sx + "-" + d.sy +"<br>" + d.tx + "-" + d.ty +"<br>"+"Traffic:<br>" + formatBytes(d.data))
            .style("left", ((d3.event.pageX)+5) + "px")
            .style("top", ((d3.event.pageY)+5) + "px");

    };

    hideInfoTip = function(){
        infotipDiv.transition()
            .duration(500)
            .style("opacity", 0);
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
            maxLevel = d3.max(data, function(d) { return d.sy; });
            console.log("max level: " + maxLevel);
            console.log("max data:  " + max);
            //console.log("calc:  " + (3/2));
            cmap = d3.scale.linear().domain([0, max/2,    max]).range(["white", "green", "black"]);

            dataset = data;
            //this.showLinks();
        }


    }

})();

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

    LinkMatrix.updateLinks(data);
    //LinkMatrix.showLinks();

});

function init(){
    Controls.addLoadAction(LinkMatrix.showLinks);

}

init();

// python -m SimpleHTTPServer 8000