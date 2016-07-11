// Filename: router.js
define([
  'jquery', 'backbone', 'app'
], function($, Backbone, app){

    "use strict";

    var AppRouter = Backbone.Router.extend({
      routes: {
        '' : 'mainpage'
      },
      mainpage: function () {
      },
      initiliaze: function () {}
    });

  return AppRouter;
  
});
