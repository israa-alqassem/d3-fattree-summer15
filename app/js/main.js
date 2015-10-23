/**
 * Created by kevin on 10/22/15.
 */
/*
 TODO: Move SETUP/INIT to different file
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



function init(){
    Controls.init();
    Controls.addLoadAction(FileManager.loadData);
    Controls.addShowAction(LinkMatrix.changeColor);   // TODO: remove "show" button
    Controls.addLinkSizeAction(LinkMatrix.updateLinkSize);
    Controls.addClusterSpaceAction(LinkMatrix.updateClusterSpace);
    Controls.addTrafficDirAction(LinkMatrix.updateTrafficDir);
    Controls.addNodeToggleAction(LinkMatrix.toggleNodes);

    FileManager.addConsumer(LinkMatrix);

}

init();
function showLinkSize(val){
    console.log(val)
}


