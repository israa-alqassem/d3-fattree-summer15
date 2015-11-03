/**
 * Created by kevin on 10/22/15.
 */

define(function(require) {
    var d3 = require("d3");

    var loadButton;
    var showButton;
    var trafficRadios;
    var nodeRadios;
    var filesList;
    var linkSizeSlider;
    var linkSizeDisplay;
    var clusterSpaceSlider;
    var clusterSpaceDisplay;

    // Private functions
    var populateFileNames;

    populateFileNames = function(){
        //filesList.append("option")
        //    .text("")
        //    .attr("value", "");
        filesList.append("option")
            .text("milc.csv")
            .attr("value", "../data/milc.csv");
    };

    var control = {};

    control.init = function(){
            loadButton = d3.select("#button-load");
            showButton = d3.select("#button-show");
            filesList = d3.select("#run");
            linkSizeSlider = d3.select("#range-link-size");
            linkSizeDisplay = d3.select("#link-size-display");
            clusterSpaceSlider = d3.select("#range-cluster-space");
            clusterSpaceDisplay = d3.select("#cluster-space-display");
            trafficRadios = d3.selectAll('input[name="traffic-direction"]');
            nodeRadios = d3.selectAll('input[name="toggle-nodes"]');

            populateFileNames();

            linkSizeDisplay.text(linkSizeSlider.node().value);
            clusterSpaceDisplay.text(clusterSpaceSlider.node().value);
    };

    control.addLoadAction = function(action) {
            var loadFile = function(){
                action(filesList.node().value);
            };
            loadButton.on("click", loadFile);
    };

    control.addShowAction = function(action){
            showButton.on("click", action );
    };

    control.addLinkSizeAction = function(action){
            linkSizeSlider.on("input", function(){
                action(this.value);
                linkSizeDisplay.text(this.value);
            });
    };

    control.addClusterSpaceAction = function(action){
            clusterSpaceSlider.on("input", function(){
                action(this.value);
                clusterSpaceDisplay.text(this.value);
            });
    };

    control.addTrafficDirAction = function(action){
            trafficRadios.on("click", function(){
                action(this.value);
                //console.log(this.value)
            });
    };

    control.addNodeToggleAction = function(action){
            nodeRadios.on("click", function(){
                action(this.value);
                //console.log(this.value)
            });
    };

    return control;
});

//var logger = function() { return console.log("log")};
