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
        render: function () { 
          this.$el.html(this.entityTemplate(this.model.attributes));
          // this.setElement();
          return this; 
        }
    });


    var LogonPage = PageViewBase.extend({
        entityTemplate: _.template($('#login-page-template').html()),
        events: {
          "change [type='email']": "loginChanged",
          "change [type='password']": "passChanged",
        },
        loginChanged: function(event) {
          this.model.set('account', $(event.currentTarget).val());
        },
        passChanged: function(event) {
          this.model.set('password', $(event.currentTarget).val());
        },
    });
    //=====================APPLICATION MODEL=====================\\
    var Application = Backbone.Model.extend({
        initialize: function () { 
          return this; 
        },
        openPage: function() {
          if(!this.get('account')) {
            var logonPage = new LogonPage({
              el: '#page-container',
              model: this
            });
            logonPage.render();
          }
          return this;
        }
    });

    //application instance
    var app = new Application();
    app.set({
      'account': ''
    }, { silent: true });

    return app;

});
