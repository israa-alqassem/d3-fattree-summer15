/**
 * Created by kevin on 15/10/29.
 */

define(function(require) {
    'use strict';

    var Controls = require('control');
    var Model = require('model');
    var View = require('view');


    return function() {
        //var dataService = DataService;

        var app = function() {};

        app.start = function() {
            Controls.init();
            Controls.addLoadAction(Model.loadData);
            Controls.addShowAction(View.changeColor);   // TODO: remove "show" button
            Controls.addLinkSizeAction(View.updateLinkSize);
            Controls.addSwitchSizeAction(View.updateSwitchSize);
            Controls.addTrafficDirAction(Model.applyDataFilters);
            Controls.addNodeToggleAction(View.toggleNodes);

            Model.addConsumer(View);
        };

        return app;
    };
});