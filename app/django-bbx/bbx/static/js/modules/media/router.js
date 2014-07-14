define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/bbx/base-functions',
    'modules/media/model', 
    'modules/media/collection',
    'views/media/MediaView', 
    'views/media/MediaPublish',
], function($, Backbone, Backbone_Subroute, BBXBaseFunctions, MediaModel, MediaCollection, MediaViewView, MediaPublishView){
    var Router = Backbone.SubRoute.extend({
	routes: {
	    '': 'publish',
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
	    console.log("media view");
	    
	    var repository = this.__getRepository(),
	    mucua = this.__getMucua();
	    
	    BBXBaseFunctions.setNavigationVars(repository, mucua, uuid);
	    BBXBaseFunctions.renderCommon('media');
	    var mediaViewView = new MediaViewView();
	    mediaViewView.render(uuid);
	},
	
	publish: function() {
	    console.log("media publish");
	    
	    var repository = this.__getRepository(),
	    mucua = this.__getMucua();
	    
	    BBXBaseFunctions.renderCommon(repository, mucua);
	    BBXBaseFunctions.setNavigationVars(repository, mucua, uuid);
	    BBXBaseFunctions.renderCommon('media');
	    var mediaPublishView = new MediaPublishView();
	    mediaPublishView.render();
	}

    });
    
    return Router;
});