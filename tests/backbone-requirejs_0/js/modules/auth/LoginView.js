define([
    'jquery', 
    'underscore',
    'backbone',
    'backbone_forms',
    'text!templates/login/LoginTemplate.html'
], function($, _, Backbone, LoginView){
    var LoginView = Backbone.View.extend({
	// define elemento associado
	el: $('#content'),


    });
    return LoginView;
});
