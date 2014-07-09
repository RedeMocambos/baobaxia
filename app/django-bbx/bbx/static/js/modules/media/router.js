define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/bbx/base-functions',
    'modules/media/model', 
    'modules/media/collection',
    'views/media/ViewMedia', 
], function($, Backbone, Backbone_Subroute, BBXBaseFunctions, MediaModel, MediaCollection, ViewMediaView){
    var Router = Backbone.SubRoute.extend({
	routes: {
	    ':uuid': 'view'
	},
	
	initialize: function() {
	    console.log("module Media loaded");
	},

	view: function(uuid) {
	    console.log("view media");
	    BBXBaseFunctions.renderCommon('media');
	    var mediaView = new ViewMediaView();
	    mediaView.render(uuid);
	}
    });
    
    return Router;
});