define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/bbx/functions',
    'modules/media/model', 
    'modules/media/collection',
    'views/media/MediaView', 
    'views/media/MediaPublish',
    'views/media/MediaUpdate',
], function($, Backbone, Backbone_Subroute, BBXFunctions, MediaModel, MediaCollection, MediaViewView, MediaPublishView, MediaUpdateView){
    var Router = Backbone.SubRoute.extend({
	routes: {
	    '': 'publish',
	    '*': 'publish',
	    ':uuid': 'view',
	    ':uuid/edit': 'update'
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
	    console.log("media view");
	    
	    var repository = this.__getRepository(),
	    mucua = this.__getMucua();
	    
	    BBXFunctions.setNavigationVars(repository, mucua, uuid);
	    BBXFunctions.renderCommon('media');
	    var mediaViewView = new MediaViewView();
	    mediaViewView.render(uuid);
	},
	
	publish: function() {
	    console.log("media publish");
	    
	    var repository = this.__getRepository(),
	    mucua = this.__getMucua();
	    
	    BBXFunctions.renderCommon(repository, mucua);
	    BBXFunctions.setNavigationVars(repository, mucua);
	    BBXFunctions.renderCommon('media');
	    var mediaPublishView = new MediaPublishView();
	    mediaPublishView.render();
	},

	update: function(uuid) {
	    console.log("media edit/update");
	    
	    var repository = this.__getRepository(),
	    mucua = this.__getMucua();
	    BBXFunctions.renderCommon('media');	    
	    var mediaUpdateView = new MediaUpdateView();
	    mediaUpdateView.render(uuid);	
	},

    });
    
    return Router;
});
