define([
    'underscore',
    'backbone'
], function(_, Backbone){
    var UserModel = Backbone.Model.extend({
	defaults: {
	    name: "Seu nome",
	    email: "seu@email.com"
	}
    });
    return UserModel;	
});