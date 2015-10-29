/**
 * Created by kevin on 15/10/29.
 */

define(function(require) {
    'use strict';

    var Controls = require('control');

    return function() {
        //var dataService = DataService;

        var app = function() {};

        app.start = function() {
            Controls.init();
        };

        return app;
    };
});