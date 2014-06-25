define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/mucua/model',
    'modules/mucua/collection',
    'modules/mocambola/model',
    'json!config.json',
    'text!templates/auth/LoginTemplate.html',
], function($, _, Backbone, MucuaModel, MucuaCollection, MocambolaModel, Config, LoginTemplate){
    var MucuaView = Backbone.View.extend({
	el: "body",
	
	render: function() {
	    
	}
    });
    
    return MucuaView;
});