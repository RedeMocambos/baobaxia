define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/bbx/base-functions',
    'modules/media/model', 
    'modules/media/collection',
], function($, Backbone, Backbone_Subroute, BBXBaseFunctions, MediaModel, MediaCollection){
    var Router = Backbone.SubRoute.extend({
	routes: {
	},
	
	initialize: function() {
	    console.log("module Media loaded");
	},
    });
    
    return Router;
});