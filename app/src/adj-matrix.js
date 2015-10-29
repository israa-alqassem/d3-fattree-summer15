/**
 * Created by kevin on 8/5/15.
 */


function formatBytes(bytes) {
    if(bytes < 1024) return bytes + " B";
    else if(bytes < 1048576) return(bytes / 1024).toFixed(3) + " KB";
    else if(bytes < 1073741824) return(bytes / 1048576).toFixed(3) + " MB";
    else return(bytes / 1073741824).toFixed(3) + " GB";
}
/*
 TODO: Move LINKMATRIX to different file
 */
var FileManager = (function(){

    // private variables
    var consumer;

    return {
        loadData: function (filename) {
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
        },

        addConsumer: function(object){
            consumer = object;
        }
    };
})();

var LinkMatrix = (function(){
    var dataset = [], switchLinkData, nodeLinkData;
    var maxX, maxY;
    var location;

    // Layout specification variables
    var linkMargin = 0;
    var linkWidth = 8;                                         // width of link in pixels
    var nodeWidth = 8;
    //var linkRadius = linkWidth/3;                               // for square with rounded corners

    var groupSizeX = 18;                                         // number of links to display horizontally/vertically per group
    var groupSizeY = [18, 36];                       // number of links to display vertically per group. Applicable to only levels 1 and 3 targets
    var clusterWidth = (linkWidth + linkMargin) * groupSizeX;           // width of cluster (group) in pixels // TODO: remove this variable since linkWidth can change dynamically
    var clusterMargin = 15;
    var displayPadding = 10;

    var cmap;
    var cmax;
    var colorId = 0;
    var colorSet1 = ["white", "white", "white", "white"];
    var colorSet2 = ["red", "green", "blue", "green"];
    var colorSet3 = ["black", "black", "black", "red"];

    // derived/dynamic layout variables
    var vizHeight = 0;
    var vizWidth = 0;
    var linkWidth_t = 0;
    var maxLevel = 0;

    // D3 object variables
    var canvas, adjMatrix, links = null;

    // Private Methods
    var updateLinks, showSquaresLink, showTriangleLinks, showInfoTip, hideInfoTip, resizeDrawing, recolorDrawing;
    var translateCoords, calcNetDimensions, calcVizDimensions;
    var drawTriangle;

    var infotipDiv = d3.select("#canvas").append("div")
        .attr("class", "infotip")
        .style("opacity", 0);

    var NodesAggregate = (function(){
        var _group = [];
        var group = [];
        var hidden = true;

        var translateNodeCoord;

        translateNodeCoord = function(x){
            return (NodesAggregate.getGroupWidth(x) * x) + clusterWidth*x + clusterMargin*x;
        };

        return{
            hide: function(){
                if (nodeLinkData === null) return;
                var i;

                group = [];
                for (i = 0; i < _group.length; i++){
                    group.push(0);
                }

                console.log("hiding");

                d3.selectAll(".nodechart").transition()
                    .style("background-color", "rgba(173, 216, 230, 0)");


                hidden = true;
            },

            expand: function(){
                if (nodeLinkData === null) return;

                group = _group;
                hidden = false;
            },

            collapse: function(){
                if (nodeLinkData === null) return;

                // Do something special
            },

            show: function(){
                if (nodeLinkData === null || hidden ) return;


                d3.selectAll(".nodechart")
                    .style("top",  displayPadding+0+"px")
                    .style("left", function(d){return translateNodeCoord(d) + "px"})
                    .style("background-color", "rgba(173, 216, 230, 1)");


            },

            getGroupSize: function(num){
                return group[num];
            },

            getGroupWidth: function(num){
                return group[num] * nodeWidth;
            },

            getGroupCount: function(){
                return group.length;
            },

            createGroups: function(){
                if (nodeLinkData === null) return;

                var size = 18;
                var groupCount;
                var i;

                _group = [];
                groupCount = Math.floor(maxX/ (groupSizeY[0]-1));

                d3.selectAll(".nodechart").remove();

                for (i = 0; i < groupCount; i++){
                    _group.push(size);
                }

                group = _group;

                for (i = 0; i < groupCount; i++){
                    d3.select("#canvas").append("div")
                        .attr("class", "nodechart")
                        .style("position", "absolute")
                        .style("top", displayPadding+0+"px")
                        .style("left", function(num){
                            return (NodesAggregate.getGroupWidth(num) * num) + clusterWidth*num + clusterMargin*num}(i)
                            + "px")
                        .style("width", this.getGroupWidth(i)+"px")
                        .style("height", this.getGroupWidth(i)+"px")
                        .style("fill", "black")
                        .style("stroke", "lightblue")
                        .datum(i);
                }

                if (hidden){
                    this.hide();
                }


            }
        }
    })();

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
        var yinner = tx % groupSizeY[yCluster];
        var youter = 0;
        for (i = 0; i < yCluster; i++){
            youter = youter + groupSizeY[i];
        }

        // get position in display
        var newY = yinner + youter;
        var newX = xinner + xouter;

        // add link margins/padding
        newX = newX * linkWidth_t;
        newY = newY * linkWidth_t;

        // add cluster margins/padding
        newX =  newX + (xCluster * clusterMargin);
        newY =  newY + (yCluster * clusterMargin);

        // add spacing for node-aggregate
        for(i = 0; i <= xCluster; i++){
            newX = newX + (NodesAggregate.getGroupWidth(i));
        }
        maxLevel = Math.max(newY, maxLevel);
        // flip image along the horizontal
        //newY = vizHeight  - newY;

        // add display padding
        newX = newX + displayPadding;
        newY = newY + displayPadding;

        return [ newX , newY ]
    };

    canvas = d3.select("#canvas")
        .append("svg")
        .attr("width", 100)
        .attr("height", 80);

    adjMatrix = canvas.append("g")
        .attr("id","linksAdjMatrix");

    adjMatrix.append("g")
        .attr("id", "links");

    updateLinks = function(){
        // Find max value and map values over colour range
        cmax = d3.max(switchLinkData, function(d) { return d.data; });
        console.log("max data:  " + cmax);

        cmap = d3.scale.linear().domain([0,  cmax/2,  cmax]).range([colorSet1[colorId], colorSet2[colorId], colorSet3[colorId]]);
        //cmap = d3.scale.linear().domain([0,  cmax/2,  cmax]).range(["white", "red", "black"]);

        calcNetDimensions();
        calcVizDimensions();

        links = d3.select("#links")
            .selectAll(".link")
            .data(switchLinkData, function(d){return d.id;});



        LinkMatrix.showLinks();
    };

    showSquaresLink = function(){
        links.exit().remove();

        links.enter()
            .append("rect")
            .attr("class","link")
            // TODO: combine the following 2 lines to remove redundant calculations
            .attr("x", function(d) { return translateCoords(d.sx, d.sy, d.tx, d.ty)[0]; })
            .attr("y", function(d) { return translateCoords(d.sx, d.sy, d.tx, d.ty)[1]; })
            //.attr("y", function(d) { var k = +!d.dir; return translateCoords(d.sx, d.sy, d.tx, d.ty)[1] + (k*linkWidth/2); })
            .attr("width", linkWidth)
            .attr("height", linkWidth)
            //.attr("ry", linkRadius)
            .style("fill", function(d) { return cmap(d.data); })
            .on("mouseover", function(d){ showInfoTip(d); })
            .on("mouseout", function(d) { hideInfoTip(); });
    };

    //canvas.append("g")
    //    .append("rect")
    //    .attr("x", clusterWidth + 20)
    //    .attr("y",  displayPadding)
    //    .attr("width", clusterWidth)
    //    .attr("height", clusterWidth)
    //    .style("fill", "lightblue")
    //    .style("stroke", "lightblue");

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

    calcNetDimensions = function(){
        maxX = d3.max(switchLinkData, function(d){return d.sx});

        NodesAggregate.createGroups();
        console.log("Max X: " + maxX);
    };

    calcVizDimensions = function(){
        var i = 0;
        linkWidth_t = (linkWidth+linkMargin);

        clusterWidth = linkWidth_t * groupSizeX;

        // TODO: this is off by linkWidth/2
        vizHeight = 0;
        for (i = 0; i < groupSizeY.length; i++){
            vizHeight = vizHeight + (groupSizeY[i] * linkWidth_t);
            if (i > 0){
                vizHeight = vizHeight + clusterMargin;
            }
        }
        // TODO: the below line corrects a "bug" in the translateCoords function
        vizHeight = vizHeight - linkWidth_t;

        vizWidth = 0;
        for (i = 0; i < NodesAggregate.getGroupCount(); i++){
            vizWidth = vizWidth + (NodesAggregate.getGroupWidth(i));
            vizWidth = vizWidth + (groupSizeX * linkWidth_t);
            if (i > 0){
                vizWidth = vizWidth + clusterMargin;
            }
        }

        //vizWidth = vizWidth + displayPadding;
        canvas.transition()
            .attr("width", displayPadding + vizWidth)
            .attr("height", displayPadding + vizHeight+linkWidth_t);
    };

    resizeDrawing = function(){
        calcVizDimensions();

        if (links === null) return;

        links.transition()
            .attr("x", function(d) { return translateCoords(d.sx, d.sy, d.tx, d.ty)[0]; })
            .attr("y", function(d) { return translateCoords(d.sx, d.sy, d.tx, d.ty)[1]; })
            .attr("width", linkWidth)
            .attr("height", linkWidth);
            //.style("fill", function(d) { return cmap(d.data); });

        NodesAggregate.show();
    };

    recolorDrawing = function(){

        if (links === null) return;

        colorId = colorId + 1;
        if (colorId == 4){
            colorId = 0;
        }

        cmap = d3.scale.linear().domain([0,  cmax/2,  cmax]).range([colorSet1[colorId], colorSet2[colorId], colorSet3[colorId]]);

        links.transition().duration(1000)
            .style("fill", function(d) { return cmap(d.data); });

        NodesAggregate.show();
    };

    return {

        consume: function(data){
            dataset = data;

            this.updateTrafficDir("up");
        },

        showLinks : function(){
            if (switchLinkData){
                showSquaresLink();
            }
        },

        changeColor : function(){
            recolorDrawing();
        },

        updateLinkSize : function(val){
            val = +val;
            linkWidth = val;

            resizeDrawing();
        },

        updateClusterSpace : function(val){
            val = +val;
            clusterMargin = val;

            resizeDrawing();
        },

        updateTrafficDir : function(val){
            var dir = 0; // shows "up" values by default

            if(val === "up"){
                dir = 0;
            } else if(val === "down"){
                dir = 1;
            } else if(val === "bi"){
                switchLinkData = dataset.filter(function (d) {
                    return (d.sy > 0);
                });
                nodeLinkData = dataset.filter(function (d) {
                    return (d.sy === 0);
                });

                updateLinks();
                return;
            }

            switchLinkData = dataset.filter(function (d) {
                return ((d.dir === dir) && (d.sy > 0));
            });
            nodeLinkData = dataset.filter(function (d) {
                return ((d.dir === dir) && (d.sy === 0));
            });

            updateLinks();
        },

        toggleNodes: function(state){
            if (state === "hide"){
                NodesAggregate.hide();
            } else if (state === "expand"){
                NodesAggregate.expand();
            } else if (state === "collapse"){
                NodesAggregate.collapse();
            }

            console.log("Toggling... " + state);
            resizeDrawing();
        }
    }
})();



// python -m SimpleHTTPServer 8000
