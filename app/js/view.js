/**
 * Created by kevin on 10/22/15.
 */
function formatBytes(bytes) {
    if(bytes < 1024) return bytes + " B";
    else if(bytes < 1048576) return(bytes / 1024).toFixed(3) + " KB";
    else if(bytes < 1073741824) return(bytes / 1048576).toFixed(3) + " MB";
    else return(bytes / 1073741824).toFixed(3) + " GB";
}

var logger = function() { return console.log("log")};

/*
 TODO: Move CONTROLS to different file
 */
var Controls = (function(){
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

    return{
        init: function(){
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
        },

        addLoadAction : function(action) {
            var loadFile = function(){
                action(filesList.node().value);
            };
            loadButton.on("click", loadFile);
        },

        addShowAction : function(action){
            showButton.on("click", action );
        },

        addLinkSizeAction : function(action){
            linkSizeSlider.on("input", function(){
                action(this.value);
                linkSizeDisplay.text(this.value);
            });
        },

        addClusterSpaceAction : function(action){
            clusterSpaceSlider.on("input", function(){
                action(this.value);
                clusterSpaceDisplay.text(this.value);
            });
        },

        addTrafficDirAction : function(action){
            trafficRadios.on("click", function(){
                action(this.value);
                //console.log(this.value)
            });
        },

        addNodeToggleAction : function(action){
            nodeRadios.on("click", function(){
                action(this.value);
                //console.log(this.value)
            });
        }
    }
})();
