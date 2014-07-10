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

	__getRepository: function() {
	    return this.prefix.split('/')[0];
	},
	__getMucua: function() {
	    return this.prefix.split('/')[1];
	},

	view: function(uuid) {
	    console.log("view media");
	    
	    var repository = this.__getRepository(),
	    mucua = this.__getMucua();

	    BBXBaseFunctions.setNavigationVars(repository, mucua, uuid);
	    BBXBaseFunctions.renderCommon('media');
	    var mediaView = new ViewMediaView();
	    mediaView.render(uuid);
	}
    });
    
    return Router;
});