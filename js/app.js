define([
  'jquery',
  'backbone'
], function ($, Backbone) {

    "use strict";

    //=====================BASE VIEWS=====================\\
    var HeaderBase = Backbone.View.extend({
        initialize: function () { return this; },
        free: function() { return this; },
        render: function () { return this; }
    });

    var FooterBase = Backbone.View.extend({
        initialize: function () { return this; },
        free: function() { return this; },
        render: function () { return this; }
    });

    var ViewFieldBase = Backbone.View.extend({
        initialize: function () { return this; },
        free: function () { return this; },
        resize: function () { return this; },
        render: function () { return this; }
    });

    var PageViewBase = Backbone.View.extend({
        initialize: function () { return this; },
        resize: function () { return this; },
        free: function () { return this; },
        render: function () { return this; }
    });

    //=====================APPLICATION MODEL=====================\\
    var Application = Backbone.Model.extend({
        initialize: function () { return this; }
    });

    //application instance
    var app = new Application();
    app.set({}, { silent: true });

    return app;

});
