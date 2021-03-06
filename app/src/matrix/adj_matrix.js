/**
 * Created by kevin on 10/31/15.
 */

define(function(require){
    var d3 = require('d3');
    var config = require('config');

    // dataset values
    var switchLinkData, nodeLinkData, switchData;
    var maxX, maxY;
    var vmax, vmin;

    var groupSizeX = 18;                // number of links to display horizontally/vertically per group
    var groupSizeY = [18, 36];          // number of links to display vertically per group. Applicable to only levels 1 and 3 targets
    var displayPadding = 10;            // padding around image

    // derived (dynamic) layout variables
    var vizHeight = 0;
    var vizWidth = 0;

    // viz containter objects
    var canvas, adjMatrix;

    // General methods
    var updateDrawing, resizeDrawing;
    var applySelection, clearSelection;
    var calcNetDimensions, calcVizDimensions;

    var updateInfoDisplay, clearInfoDisplay;

    // paints elements white if their data value is 0
    var cmap = function(val){
        if(val === 0){
            return "white";
        }
        else{
            return config.color(val);
        }
    };
    // converts bytes to KB, MB, and GB
    var formatBytes = function(bytes) {
        if(bytes < 1024) return bytes + " B";
        else if(bytes < 1048576) return(bytes / 1024).toFixed(3) + " KB";
        else if(bytes < 1073741824) return(bytes / 1048576).toFixed(3) + " MB";
        else return(bytes / 1073741824).toFixed(3) + " GB";
    };
    // flips image coordinates vertically
    var invertYCoord = function(val){
        // Uncomment only one of the following lines. The first line inverts the image vertically
        return vizHeight - val;
        //return val;
    };

    var infotipDiv = d3.select("#canvas").append("div")
        .attr("class", "infotip")
        .style("opacity", 0);
    var infoDisplay = d3.select("#info-display").append("div")
        .attr("class", "infodisplay");

    // Prepares and displays switch elements in the network
    var SwitchElements = (function(){
        var switchdata = [];
        var hidden = false;
        var switchWidth = 30;
        var switchMargin = 0;
        var groupgap = 4;
        var switches;

        var transformData, translateSwitchCoord;
        var getWidth, getHeight;

        transformData = function(){

            // TODO: this area will have eventually transform the data
            switchdata = switchData;
        };

        translateSwitchCoord = function(xval, yval){
            var type;
            var x, y, i;
            // gx and gy are used to store the switch group's x position and y position, respectively.
            var gx, gy;
            var pos;        // pos stores the location with a switch group

            if (yval % 2 === 1){
                type = "col";
                gy = Math.floor(yval / 2);
                gx = Math.floor(xval / groupSizeY[gy]);
                pos = xval % groupSizeY[gy];
            }
            else{
                type = "row";
                gy = Math.floor(yval / 2) - 1;
                gx = Math.floor(xval / groupSizeX);
                pos = xval % groupSizeX;
            }

            x = y = 0;

            // add space for each preceding columns and clusters
            for (i = 0; i <= gx; i++){
                x = x + NodesAggregate.getGroupWidth(i);
            }
            for (i = 0; i < gx; i++){
                x = x + SwitchElements.getGroupWidth(i);
                x = x + LinkElements.getGroupWidth(i); // + clusterMargin;
            }
            for (i = 0; i < gy; i++){
                y = y + SwitchElements.getGroupWidth(i);
                y = y + LinkElements.getGroupHeight(i); // + clusterMargin;
            }

            if ( type === "col" ){
                x = x + groupgap/2;

                // add position within switchgroup. linkWidth is used because switches are aligned to links
                y = y + pos * LinkElements.getLinkWidth_t();
            }
            else{
                // add position for first cluster elements
                x = x + SwitchElements.getGroupWidth(0);
                y = y + groupgap/2;
                y = y + LinkElements.getGroupHeight(0); //clusterWidth;

                // add position within switchgroup. linkWidth is used because switches are aligned to links
                x = x + pos * LinkElements.getLinkWidth_t();
            }

            // inverts image vertical
            if ( y != invertYCoord(y)){
                y = invertYCoord(y);
                if (type === "col") {
                    y = y - LinkElements.getLinkWidth_t();
                }
                else{
                    y = y - SwitchElements.getGroupWidth(i);
                    y = y + groupgap;
                }
            }

            // add display padding
            x = x + displayPadding;
            y = y + displayPadding;

            return [x, y];
        };

        getWidth = function(y){
            if (y % 2 === 1){
                return switchWidth;
            } else{
                return LinkElements.getLinkWidth_t();
            }
        };

        getHeight = function(y){
            if (y % 2 === 0){
                return switchWidth;
            } else{
                return LinkElements.getLinkWidth_t();
            }
        };

        return{
            init: function(){
                adjMatrix.append('g')
                    .attr('id', 'switches');
            },

            update : function(){
                transformData();

                switches = d3.select("#switches").selectAll(".switch")
                    .data(switchdata);
            },

            draw : function(){
                if (hidden){
                    SwitchElements.hide();
                }

                switches.exit().remove();
                switches.enter()
                    .append("rect")
                    .attr("class", "switch")
                    .attr("y", function(d){
                        //console.log("style - " + d.ty);
                        return translateSwitchCoord(d.x, d.y)[1]
                    })
                    .attr("x", function(d,i){
                        //console.log("style" + d.tx);
                        return translateSwitchCoord(d.x, d.y)[0]
                    })
                    .attr("width", function(d){ return getWidth(d.y)})
                    .attr("height", function(d){return getHeight(d.y)})
                    .style("fill", function(d) { return cmap(d.data); })
                    .style("stroke", "white")
                    .on("mousedown", function(d){
                        applySelection("switch", d.x, d.y, null, null);
                        updateInfoDisplay("switch", d);
                    })
                    .on("mouseup", function(d){
                        clearSelection("switch");
                        clearInfoDisplay();
                    });
            },

            hide: function(){
                switches.style("opacity", 0);
                hidden = true;
            },

            expand: function(){
                switches.style("opacity", 1);
                hidden = false;
            },

            collapse: function(){

            },

            resize : function(){
                switches.transition()
                    .attr("y", function(d){ return translateSwitchCoord(d.x, d.y)[1]})
                    .attr("x", function(d){ return translateSwitchCoord(d.x, d.y)[0]})
                    .attr("width", function(d){return getWidth(d.y)})
                    .attr("height", function(d){return getHeight(d.y)});
            },

            recolor : function(){
                switches.transition()
                    .style("fill", function(d) { return cmap(d.data); });
            },

            getGroupWidth: function(num){
                if(hidden) return groupgap;
                return switchWidth + switchMargin + groupgap;
            },

            setSwitchSize: function(val){
                switchWidth = val;
            }
        }
    })();

    // Prepares and displays compute nodes (aggregates) in the network
    var NodesAggregate = (function(){
        var groupgap = 10;      // gap between node group and it's respective switch cluster

        var _group = [];
        var group = [];
        var hidden = true;
        var nodedata;
        var nodechart;

        var createGroups, calcNodeBarSpan;
        var translateGroupCoord, translateNodeCoord;
        var transformData;

        var nodes;
        var nodebars;
        var nodegroups;

        var nodeWidth = 0;
        var nodeMargin = 0;
        var nodeWidth_t = nodeWidth + nodeMargin;

        translateGroupCoord = function(val){
            var i;
            var clusterSpan = LinkElements.getGroupWidth(0);//clusterWidth; // + clusterMargin ;

            var x = 0;
            var y = 0;

            // add spacing for link clusters (start after the first cluster)
            x = x + (val * clusterSpan);

            // add spacing for previous groups
            for(i = 0; i < val; i++){
                x = x + NodesAggregate.getGroupWidth(i);
            }

            // add spacing for switches
            for(i = 0; i < val; i++){
                x = x + SwitchElements.getGroupWidth(i);
            }

            // flip node vertically
            if (y != invertYCoord(y)){
                y = invertYCoord(y) - NodesAggregate.getGroupSize(val);
            }

            // add spacing for display padding
            x = x + displayPadding;
            y = y + displayPadding;

            return [x, y];
            //return val * (NodesAggregate.getGroupSize(va) + clusterWidth + clusterMargin + groupgap) + displayPadding;
        };

        translateNodeCoord = function(x){

            // find position of containing nodegroup, position within nodegroup
            var gnum = Math.floor(x/(groupSizeX*groupSizeX));
            var gval = x % (groupSizeX*groupSizeX);
            //var gx   = Math.floor(gval/groupSizeX);
            //var gy   = gval % groupSizeX;
            var gx   = gval % groupSizeX;
            var gy   = Math.floor(gval/groupSizeX);

            // get position of container group
            var newX = translateGroupCoord(gnum)[0];
            var newY = 0;                           // groups are horizontal only

            // add node  margins/padding
            newX = newX + gx * nodeWidth_t;
            newY = newY + gy * nodeWidth_t;

            // flip node virtically
            if (newY != invertYCoord(newY)){
                newY = invertYCoord(newY);
                newY = newY - nodeWidth_t;
            }

            // add display padding for Y. Padding is already added for X via group location
            newY = newY + displayPadding;

            return [newX, newY];
        };

        transformData = function(){
            var i;
            var parentcount;
            var count = 0;

            parentcount = d3.max(nodeLinkData, function(d){return d.tx});

            nodedata = [];
            for(i = 0; i <= parentcount; i++){
                nodedata[i] = [];
            }

            nodeLinkData.forEach(function (d) {
                nodedata[d.tx].push(d.data);
                count = count + 1;
            });
            console.log("Nodes processed: " + nodedata.length);
        };

        createGroups = function(){

            var size = groupSizeX;
            var groupCount;
            var i, gids = [];

            _group = [];
            groupCount = Math.floor(nodedata.length/ (groupSizeY[0]-1));

            for (i = 0; i < groupCount; i++){
                _group.push(size);
                gids.push(i);
            }

            group = _group;

            return gids;
        };

        calcNodeBarSpan = function(vals){
            var span = 0;

            // count # of non-zero elements
            vals.forEach(function(d){
                if (d != 0) span = span+1;
            });

            //set size based on the # of non-zero elements
            span = span * nodeWidth;

            return span;
        };

        return{
            init: function(){
                adjMatrix.append('g')
                    .attr('id', 'nodes');
            },

            update: function(){
                transformData();
                NodesAggregate.setNodeWidth(LinkElements.getLinkWidth_t());

                nodegroups = d3.select("#nodes").selectAll(".nodegroup")
                    .data(createGroups());

                nodebars = d3.select("#nodes").selectAll(".nodebar")
                    .data(nodedata);
                    //.data(nodeLinkData, function(d){return d.id;});
            },

            draw : function(){
                if (hidden){
                    NodesAggregate.hide();
                }

                nodegroups.exit().remove();
                nodegroups.enter()
                    .append("rect")
                    .attr("class", "nodegroup")
                    .attr("y", function(d){ return translateGroupCoord(d)[1]})
                    .attr("x", function(d){  return translateGroupCoord(d)[0]})
                    .attr("width", function(d){ return NodesAggregate.getGroupSize(d)})
                    .attr("height", function(d){return NodesAggregate.getGroupSize(d)})
                    .style("fill", "lightgrey")
                    .style("stroke", "black")
                    .style("opacity", 0);

                nodebars.exit().remove();
                nodebars.enter()
                    .append("rect")
                    .attr("class", "nodebar")
                    .attr("y", function(d,i){
                        return translateNodeCoord(i*18)[1]
                    })
                    .attr("x", function(d,i){
                        //console.log("style" +d);
                        var x = translateNodeCoord(i*18)[0];
                        var pos = NodesAggregate.getGroupWidth(0) - calcNodeBarSpan(d);
                        return x + pos;
                    })
                    .attr("width", function(d){ return calcNodeBarSpan(d);})
                    .attr("height", function(d){return nodeWidth;})
                    .style("fill", "grey")
                    .style("stroke", "darkgrey")
                    .style("opacity", 0);
            },

            hide: function(){
                //if (nodeLinkData === null) return;
                var i;

                group = [];
                for (i = 0; i < _group.length; i++){
                    group.push(0);
                }

                nodegroups.style("opacity", 0);
                nodebars.style("opacity", 0);

                hidden = true;
            },

            expand: function(){
                //TODO: Clean up file

                var i;

                group = [];
                for (i = 0; i < _group.length; i++){
                    group.push(0);
                }

                nodegroups.style("opacity", 1);
                nodebars.style("opacity", 1);

                group = _group;
                hidden = false;
            },

            collapse: function(){
                if (nodeLinkData === null) return;

                // Do something special
            },

            resize : function(){
                nodegroups.transition()
                    .attr("y", function(d){ return translateGroupCoord(d)[1]})
                    .attr("x", function(d){ return translateGroupCoord(d)[0]})
                    .attr("width", function(d){ return NodesAggregate.getGroupSize(d)})
                    .attr("height", function(d){ return NodesAggregate.getGroupSize(d)});
                    //.style("fill", "lightblue");

                nodebars.transition()
                    .attr("y", function(d, i){ return translateNodeCoord(i*18)[1]})
                    .attr("x", function(d, i){
                        var x = translateNodeCoord(i*18)[0];
                        var pos = NodesAggregate.getGroupWidth(0) - calcNodeBarSpan(d);
                        return x + pos;
                    })
                    .attr("width", function(d){ return calcNodeBarSpan(d)})
                    .attr("height", function(d){ return nodeWidth});
            },

            recolor : function(){
                nodegroups.transition()
                    .style("fill", "lightgreen");
            },

            getGroupSize: function(num){
                return group[num] * nodeWidth_t;
            },

            getGroupWidth: function(num){
                if (hidden) return 0;
                return NodesAggregate.getGroupSize(num);
            },

            getGroupCount: function(){
                return group.length;
            },

            setNodeWidth : function(val){
                nodeWidth = val;
                nodeWidth_t = nodeWidth + nodeMargin;
            }

        }
    })();

    // Prepares and displays internconnect links in the network
    var LinkElements = (function(){
        var hidden = false;

        var linkMargin = 0;
        var linkWidth =  5;                                         // width of link in pixels
        var linkWidth_t = linkWidth + linkMargin;
        var clusterPadding = 30;
        var clusterWidth = linkWidth_t * groupSizeX;

        var links;                                                      // d3 array of link(rect) objects
        var linkdata;

        //var linkRadius = linkWidth/3;                               // for square with rounded corners
        var translateCoords, showSquaresLink, transformData;


        transformData = function(){
            linkdata = switchLinkData;
        };

        translateCoords = function (sx, sy, tx, ty){
            // Always plot links with source (sx, sy) along the X axis.
            // Eg1: for HCA (level 0) to edge switches (level 1), (sx, sy) = HCA and (tx, ty) = level1 switch
            // Eg2: for edge switches (level 1) to level 2 switches, (sx, sy) = level 2 and (tx, ty) = level 1 switch
            var i;
            var newY = 0;
            var newX = 0;

            if (sy % 2 === 1){
                var tmp = [tx, ty];
                tx = sx;
                ty = sy;
                sx = tmp[0];
                sy = tmp[1];
            }

            // find position of containing cluster, position within cluster
            var xCluster = Math.floor(sx/groupSizeX);
            var xInner = sx % groupSizeX;

            var yCluster = Math.floor(ty/groupSizeY.length);
            var yInner = tx % groupSizeY[yCluster];

            // get cluster position
            for(i = 0; i < xCluster; i++){
                newX = newX + (LinkElements.getGroupWidth(i));
            }
            for(i = 0; i < yCluster; i++){
                newY = newY + (LinkElements.getGroupWidth(i) - clusterPadding);
            }

            // get position in cluster
            for(i = 0; i < xInner; i++){
                newX = newX + (LinkElements.getLinkWidth_t());
            }
            for(i = 0; i < yInner; i++){
                newY = newY + (LinkElements.getLinkWidth_t());
            }

            // add spacing for node-aggregate
            for(i = 0; i <= xCluster; i++){
                newX = newX + (NodesAggregate.getGroupWidth(i));
            }
            // add spacing for switches
            for(i = 0; i <= xCluster; i++){
                newX = newX + (SwitchElements.getGroupWidth(i));
            }
            for(i = 0; i < yCluster; i++){
                newY = newY + (SwitchElements.getGroupWidth(i));
            }

            // flip image along the horizontal
            if( newY != invertYCoord(newY)){
                newY = invertYCoord(newY);
                newY = newY - linkWidth_t;
            }

            // add display padding
            newX = newX + displayPadding;
            newY = newY + displayPadding;

            return [ newX , newY ]
        };

        return {
            init: function () {
                adjMatrix.append("g")
                    .attr("id", "links");
            },

            update: function(){
                transformData();

                links = d3.select("#links")
                    .selectAll(".link")
                    .data(linkdata, function(d){return d.id;});
            },

            draw : function(){
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
                    //.on("mouseover", function(d){ showInfoTip(d); })
                    //.on("mouseout", function() { hideInfoTip(); })
                    .on("mousedown",  function(d) {
                        applySelection("link", d.sx, d.sy, d.tx, d.ty);
                        updateInfoDisplay("link", d);
                    })
                    .on("mouseup", function() {
                        clearSelection("link");
                        clearInfoDisplay();
                    });
            },

            hide: function(){
                links.style("opacity", 0);
                hidden = true;
            },

            expand: function(){
                links.style("opacity", 1);
                hidden = false;
            },

            collapse: function(){
                if (linkdata === null) return;

                // Do something special
            },

            resize : function(){
                links.transition()
                    .attr("x", function(d) { return translateCoords(d.sx, d.sy, d.tx, d.ty)[0]; })
                    .attr("y", function(d) { return translateCoords(d.sx, d.sy, d.tx, d.ty)[1]; })
                    .attr("width", linkWidth)
                    .attr("height", linkWidth);
                //.style("fill", function(d) { return cmap(d.data); });
            },

            recolor : function(){
                links.transition().duration(1000)
                    .style("fill", function(d) { return cmap(d.data); });
            },

            getGroupWidth: function(num){
                return clusterWidth + clusterPadding;//+clusterMargin;
            },

            getGroupWidth_base: function(num){           // without spacing elemets
                return clusterWidth;//+clusterMargin;
            },

            getGroupHeight: function(num){
                return clusterWidth;
            },

            setLinkWidth: function(val){
                linkWidth = val;

                linkWidth_t = linkWidth + linkMargin;
                clusterWidth = linkWidth_t * groupSizeX;
            },

            getLinkWidth_t: function(){
                return linkWidth_t;
            }
        }
    })();

    canvas = d3.select("#canvas")
        .append("svg")
        .attr("width", 100)
        .attr("height", 80);

    adjMatrix = canvas.append("g")
        .attr("id","linksAdjMatrix");

    LinkElements.init();
    NodesAggregate.init();
    SwitchElements.init();

    applySelection = function(type, sx, sy, tx, ty) {
        var switches = d3.select("#switches").selectAll(".switch");
        var links = d3.select("#links").selectAll(".link");
        var nodes = d3.select("#nodes").selectAll(".nodebar");
        var alpha = 0.2;

        var fadeAll = function(d){
            var opacity;

            if( ((d.sx === sx) && (d.sy === sy)) &&
                ((d.tx === tx) && (d.ty === ty)))
                opacity = 1;
            else
                opacity = alpha;

            return opacity;
        };

        var fadePath = function(d){
            var opacity;

            if( ((d.sx === sx) && (d.sy === sy)) ||
                ((d.sx === tx) && (d.sy === ty)) ||
                ((d.tx === sx) && (d.ty === sy)) ||
                ((d.tx === tx) && (d.ty === ty)))
                opacity = 1;
            else
                opacity = alpha;

            return opacity;
        };

        var fadePoint = function(d){
            var opacity;

            if( ((d.x === sx) && (d.y === sy)) ||
                ((d.x === tx) && (d.y === ty)))
                opacity = 1;
            else
                opacity = alpha;

            return opacity;
        };


        if (type === "switch"){
            switches.style("opacity", function(d){ return fadePoint(d)});
            links.style("opacity", function(d){ return fadePath(d)});
            //nodes.style("opacity", function(d){ return fade(d)});
        }
        if (type === "link"){
            switches.style("opacity", function(d){ return fadePoint(d)});
            links.style("opacity", function(d){ return fadeAll(d)});
        }
    };

    clearSelection = function(type){
        var switches = d3.select("#switches").selectAll(".switch");
        var links = d3.select("#links").selectAll(".link");

        switches.style("opacity", 1);
        links.style("opacity", 1);
    };

    var showInfoTip = function(d){

        infotipDiv.transition()
            .duration(500)
            .style("opacity", .9);
        infotipDiv.html(d.sx + "-" + d.sy +"<br>" + d.tx + "-" + d.ty +"<br>"+"Traffic:<br>" + formatBytes(d.data))
            .style("left", ((d3.event.pageX)+5) + "px")
            .style("top", ((d3.event.pageY)+5) + "px");

    };

    var hideInfoTip = function(){
        infotipDiv.transition()
            .duration(500)
            .style("opacity", 0);
    };

    updateInfoDisplay = function(type ,d){
        var output = "";

        if (type === "switch"){
            output = "<strong>SWITCH</strong><br/>";
            output = output + "&nbsp;&nbsp;x: " + d.x + "<br/>";
            output = output + "&nbsp;&nbsp;y: " + d.y + "<br/>";
            output = output + "<br/>";
            output = output + "&nbsp;&nbsp;Traffic : <strong>" + formatBytes(d.data) + "</strong>";
        }
        if (type === "link"){

            output = "<strong>LINK</strong><br/>";
            output = output + "&nbsp;&nbsp;sx: " + d.sx + "&nbsp;&nbsp;&nbsp;&nbsp;sy: " + d.sy + "<br/>";
            output = output + "&nbsp;&nbsp;tx: " + d.tx + "&nbsp;&nbsp;&nbsp;&nbsp;ty: " + d.ty + "<br/>";
            output = output + "<br/>";
            output = output + "&nbsp;&nbsp;Traffic : <strong>" + formatBytes(d.data) + "</strong>";
        }
        infoDisplay.html(output);
    };

    clearInfoDisplay = function(){
        infoDisplay.html("<em>Click on an element to view it's information here.</em>");
    };
    clearInfoDisplay();

    calcNetDimensions = function(){
        maxX = d3.max(switchLinkData, function(d){return d.sx});
        maxY = d3.max(switchLinkData, function(d){return d.ty});

        //NodesAggregate.update();
        console.log("Max X is: " + maxX);
        console.log("Max Y is: " + maxY);
    };

    calcVizDimensions = function(){
        var i = 0;

        var linkWidth_t = LinkElements.getLinkWidth_t();

        vizHeight = 0;
        vizWidth = 0;

        // Add space for nodes and links
        for (i = 0; i < groupSizeY.length; i++){
            vizHeight = vizHeight + (groupSizeY[i] * linkWidth_t);
        }
        for (i = 0; i < Math.floor(maxX/ (groupSizeX-1)); i++){
            vizWidth = vizWidth + NodesAggregate.getGroupWidth(i);
            vizWidth = vizWidth + LinkElements.getGroupWidth(i);
        }

        // Add spaces for switches
        var scountx = Math.floor(maxX/ (groupSizeX-1));
        var scounty = Math.floor(maxY / 2);

        for (i = 0; i < scountx; i++){
            vizWidth = vizWidth + SwitchElements.getGroupWidth(i);
        }
        for (i = 0; i < scounty; i++){
            vizHeight = vizHeight + SwitchElements.getGroupWidth(i);
        }

        //vizWidth = vizWidth + displayPadding;
        canvas.transition()
            .attr("width", displayPadding + vizWidth)
            .attr("height", displayPadding + vizHeight+linkWidth_t);
    };

    resizeDrawing = function(){
        calcVizDimensions();

        LinkElements.resize();
        NodesAggregate.resize();
        SwitchElements.resize();
    };

    updateDrawing = function(){
        vmax = d3.max(switchLinkData, function(d) { return d.data; });
        vmin = d3.min(switchLinkData, function(d) { if (d.data != 0) return d.data; else return null;});

        //data_range
        console.log("max data:  " + vmax);
        console.log("min data:  " + vmin);

        config.data_range([vmin, vmax]);

        LinkElements.update();
        NodesAggregate.update();
        SwitchElements.update();

        calcNetDimensions();
        calcVizDimensions();

        LinkElements.draw();
        NodesAggregate.draw();
        SwitchElements.draw();
    };

    var adj = {};

    adj.consume = function(data){

        switchLinkData = data.switchlink;
        nodeLinkData = data.nodelink;
        switchData = data.switch;

        updateDrawing();
    };

    adj.changeColor = function() {
        config.change_color();

        LinkElements.recolor();
        NodesAggregate.recolor();
        SwitchElements.recolor();

        return config.VALUES_COLORMAP;
    };

    adj.updateLinkSize = function(val){
        val = +val;

        LinkElements.setLinkWidth(val);
        NodesAggregate.setNodeWidth(val);

        resizeDrawing();
    };

    adj.updateSwitchSize = function(val){
        val = +val;
        SwitchElements.setSwitchSize(val);

        resizeDrawing();
    };

    adj.toggleNodes = function(state){
        if (state === "hide"){
            NodesAggregate.hide();
            //SwitchElements.hide();
        } else if (state === "expand"){
            NodesAggregate.expand();
            //SwitchElements.expand();
        } else if (state === "collapse"){
            NodesAggregate.collapse();
            //SwitchElements.collapse();
        }

        console.log("Toggling... " + state);
        resizeDrawing();
    };

    return adj;
});
