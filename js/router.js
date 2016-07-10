// Filename: router.js
define([
  'jquery',
  'dc/backbone',
  'dc/app'
], function($, Backbone, app){

    "use strict";

    var AppRouter = Backbone.Router.extend({
      routes: {
        '' : 'nodePage',
        'level/:level/node/:node': 'nodePage',
        'level/:level/node/:node/:measure': 'unitAnalyticsPage',
        '*pageNotFound': 'pageNotFound'
      },
      nodePage: function (level, node) {
          if (!level && !node) {
              level = 'A';
              node = 'Global';
          };
          app.showPage(level, node);
      },
      unitAnalyticsPage: function (level, node, measure) {
          app.showPage(level, node, measure);
      },
      pageNotFound: function () {
          app.showPage404();
      },
      initiliaze: function () {}
    });

  return AppRouter;
  
});
