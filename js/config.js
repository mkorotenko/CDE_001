// Filename: main.js
require.config({
    baseUrl: 'js',
    paths: {
        bootstrap: 'bootstrap/bootstrap.min',
        jquery: 'jquery/jquery-2.0.3'
    },
    waitSeconds: 5,
    map: {
      '*': {
        }
    },
    shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        },
        'bootstrap': {
            deps: ['jquery']
        }
    }
});

require(['jquery'], function ($) {

      require(['backbone', 'router'], function (Backbone, Router) {
              router = new Router();
              router.initiliaze();
              Backbone.history.start();
          },
          function (error) {
              console.log('REQUIREjs ERROR');
              console.log(arguments);
          });
},
function () {
    console.log('A network error occurred.');
    // document.getElementById('page-container').innerHTML = '<h2 style="margin: 10px;color: #c01616;">A network error occurred. Please try later.</h2>';
});
