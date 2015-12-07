/**
 * Created by kevin on 10/22/15.
 */

define(function(require) {
    var d3 = require("d3");

    var loadButton;
    var colorButton;
    var trafficRadios;
    var nodeRadios;
    var filesList;
    var linkSizeSlider;
    var linkSizeDisplay;
    var switchSizeSlider;
    var switchSizeDisplay;

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
            colorButton = d3.select("#button-color");
            filesList = d3.select("#run");
            linkSizeSlider = d3.select("#range-link-size");
            linkSizeDisplay = d3.select("#link-size-display");
            switchSizeSlider = d3.select("#range-switch-size");
            switchSizeDisplay = d3.select("#switch-size-display");
            trafficRadios = d3.selectAll('input[name="traffic-direction"]');
            nodeRadios = d3.selectAll('input[name="toggle-nodes"]');

            populateFileNames();

            linkSizeDisplay.text(linkSizeSlider.node().value);
            switchSizeDisplay.text(switchSizeSlider.node().value);
    };

    control.addLoadAction = function(action) {
            var loadFile = function(){
                action(filesList.node().value);
            };
            loadButton.on("click", loadFile);
    };

    control.addColorAction = function(action){
            colorButton.on("click", action );
    };

    control.addLinkSizeAction = function(action){
            linkSizeSlider.on("input", function(){
                action(this.value);
                linkSizeDisplay.text(this.value);
            });
    };

    control.addSwitchSizeAction = function(action){
            switchSizeSlider.on("input", function(){
                action(this.value);
                switchSizeDisplay.text(this.value);
            });
    };

    control.addTrafficDirAction = function(action){
            trafficRadios.on("click", function(){
                action([['trafdir', this.value]]);
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
