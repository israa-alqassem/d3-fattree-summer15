/**
 * Created by kevin on 10/31/15.
 */

/**
 * Created by kevin on 8/5/15.
 */


/*
 TODO: Move LINKMATRIX to different file
 */


define(function(require){
    var d3 = require('d3');

    var switchLinkData, nodeLinkData;
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
    var updateDrawing, updateLinks, updateNodes, setupNodes;
    var showSquaresLink, showTriangleLinks, showInfoTip, hideInfoTip, resizeDrawing, recolorDrawing;
    var translateCoords, calcNetDimensions, calcVizDimensions;
    var drawTriangle;


    var formatBytes = function(bytes) {
        if(bytes < 1024) return bytes + " B";
        else if(bytes < 1048576) return(bytes / 1024).toFixed(3) + " KB";
        else if(bytes < 1073741824) return(bytes / 1048576).toFixed(3) + " MB";
        else return(bytes / 1073741824).toFixed(3) + " GB";
    };

    var infotipDiv = d3.select("#canvas").append("div")
        .attr("class", "infotip")
        .style("opacity", 0);

    var NodesAggregate = (function(){
        var _group = [];
        var group = [];
        var hidden = true;
        var nodedata = [];
        var nodechart;

        var createGroups;
        var translateNodeCoord;
        var transformData;

        var nodes;
        var nodebars;
        var nodegroups;

        translateNodeCoord = function(x){
            return (NodesAggregate.getGroupWidth(x) * x) + clusterWidth*x + clusterMargin*x;
        };

        transformData = function(){
            var i;
            var count = 0;

            for(i = 0; i <= maxX; i++){
                nodedata[i] = [];
            }
            console.log(maxX);
            nodeLinkData.forEach(function (d) {
                nodedata[d.tx].push(d.data);
                count = count + 1;
            });
            console.log("Nodes processed: " + count);
        };

        createGroups = function(){
            if (nodeLinkData === null) return;

            var size = groupSizeX;
            var groupCount;
            var i, gids = [];

            _group = [];
            groupCount = Math.floor(maxX/ (groupSizeY[0]-1));

            for (i = 0; i < groupCount; i++){
                gids.push(i);
                _group.push(size);
            }

            group = _group;
            transformData();

            d3.selectAll('nodegroup').remove();

            nodegroups = d3.select("#nodes").selectAll("nodegroup")
                .data(gids);

            if (hidden){
                NodesAggregate.hide();
            }
        };

        return{
            init: function(){
                adjMatrix.append('g')
                    .attr('id', 'nodes');
            },

            setup: function(){
                createGroups();
            },

            update: function(){
                this.show();
            },

            hide: function(){
                if (nodeLinkData === null) return;
                var i;

                group = [];
                for (i = 0; i < _group.length; i++){
                    group.push(0);
                }

                console.log("hidin");

                transformData();

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

                nodegroups.exit().remove();
                nodegroups.enter().append('rect')
                    .attr('class', 'nodegroup')
                    .attr("y", displayPadding+0)
                    .attr("x", function(d){
                        console.log("style" +d); return (NodesAggregate.getGroupWidth(d) * d) + clusterWidth*d + clusterMargin*d})
                    .attr("width", function(d){ console.log("width" +d); return NodesAggregate.getGroupWidth(d)})
                    .attr("height", function(d){console.log("height" +d); return NodesAggregate.getGroupWidth(d)})
                    .style("fill", "lightblue")
                    .style("stroke", "black");


                //d3.selectAll(".nodechart")
                //    .style("top",  displayPadding+0+"px")
                //    .style("left", function(d){return translateNodeCoord(d) + "px"})
                //    .style("background-color", "rgba(173, 216, 230, 1)");


            },

            getGroupSize: function(num){
                return group[num];
            },

            getGroupWidth: function(num){
                return group[num] * nodeWidth;
            },

            getGroupCount: function(){
                return group.length;
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

    NodesAggregate.init();

    var showLinks = function(){
        if (switchLinkData){
            showSquaresLink();
        }
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

        NodesAggregate.update();
        console.log("Max X is: " + maxX);
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

    setupNodes = function(){
        NodesAggregate.setup();
    };

    updateLinks = function(){
        // Find max value and map values over colour range


        links = d3.select("#links")
            .selectAll(".link")
            .data(switchLinkData, function(d){return d.id;});


        showLinks();
    };

    updateDrawing = function(){
        cmax = d3.max(switchLinkData, function(d) { return d.data; });
        console.log("max data:  " + cmax);

        cmap = d3.scale.linear().domain([0,  cmax/2,  cmax]).range([colorSet1[colorId], colorSet2[colorId], colorSet3[colorId]]);
        //cmap = d3.scale.linear().domain([0,  cmax/2,  cmax]).range(["white", "red", "black"]);

        calcNetDimensions();
        calcVizDimensions();

        updateLinks();
        setupNodes();
    };

    var adj = {};
    adj.consume = function(data){
        switchLinkData = data.switch;
        nodeLinkData = data.node;

        updateDrawing();
        //console.log("Trigger display: adj.consume");
    };

    adj.showLinks = function(){
        showLinks();
    };

    adj.changeColor = function() {
        recolorDrawing();
    };

    adj.updateLinkSize = function(val){
        val = +val;
        linkWidth = val;

        resizeDrawing();
    };

    adj.updateClusterSpace = function(val){
        val = +val;
        clusterMargin = val;

        resizeDrawing();
    };



    adj.toggleNodes = function(state){
        if (state === "hide"){
            NodesAggregate.hide();
        } else if (state === "expand"){
            NodesAggregate.expand();
        } else if (state === "collapse"){
            NodesAggregate.collapse();
        }

        console.log("Toggling... " + state);
        resizeDrawing();
    };

    return adj;
});



// python -m SimpleHTTPServer 8000
