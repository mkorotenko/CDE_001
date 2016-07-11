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
        app.openPage();
      },
      initiliaze: function () {}
    });

  return AppRouter;
  
});
