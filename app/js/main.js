/**
 * Created by kevin on 10/22/15.
 */
/*
 TODO: Move SETUP/INIT to different file
 */





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
