/**
 * Created by kevin on 15/10/27.
 */

require.config({

    baseUrl: 'src',

    paths: {
        d3: '../lib/d3/d3'
    }
});


// bootstrap the application
require(['app'], function(app) {
    app().start();
});