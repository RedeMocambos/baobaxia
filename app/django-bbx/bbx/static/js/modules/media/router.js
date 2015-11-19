define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/bbx/functions',
    'modules/media/model', 
    'modules/media/collection',
    'views/media/MediaView', 
    'views/media/MediaPublish',
    'views/media/MediaGalleryCreate',
    'views/media/MediaGalleryEdit',
    'views/media/MediaUpdate',
], function($, Backbone, Backbone_Subroute, BBXFunctions, MediaModel, MediaCollection, MediaViewView, MediaPublishView, MediaGalleryCreateView, MediaGalleryEditView, MediaUpdateView){
    var Router = Backbone.SubRoute.extend({
	routes: {
	    'gallery': 'gallery_create',
	    'gallery/*tags/edit': 'gallery_edit',
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
		mucua = this.__getMucua(),
		mediaViewView = new MediaViewView();
	    
	    BBXFunctions.setNavigationVars(repository, mucua, uuid);
	    BBXFunctions.renderCommon('media');
	    
	    mediaViewView.render(uuid);
	},
	
	publish: function() {
	    console.log("media publish");
	    
	    var repository = this.__getRepository(),
		mucua = this.__getMucua(),
		mediaPublishView = new MediaPublishView();
	    
	    BBXFunctions.renderCommon(repository, mucua);
	    BBXFunctions.setNavigationVars(repository, mucua);
	    BBXFunctions.renderCommon('media');
	    
	    mediaPublishView.render();
	},

	gallery_create: function() {
	    console.log("create gallery");
	    
	    var repository = this.__getRepository(),
		mucua = this.__getMucua(),
		mediaGalleryCreateView = new MediaGalleryCreateView();
	    
	    BBXFunctions.renderCommon(repository, mucua);
	    BBXFunctions.setNavigationVars(repository, mucua);
	    BBXFunctions.renderCommon('media');
	    
	    mediaGalleryCreateView.render();	    
	},

	gallery_edit: function(subroute) {
	    console.log("gallery edit");
	    
	    var repository = this.__getRepository(),
		mucua = this.__getMucua(),
		mediaGalleryEditView = new MediaGalleryEditView(),
		limit = '';
	    
	    BBXFunctions.renderCommon(repository, mucua);
	    BBXFunctions.setNavigationVars(repository, mucua);
	    BBXFunctions.renderCommon('media');

	    if (!_.isNull(subroute)) {
		if (subroute.match('limit')) {
		    var matches = subroute.split('/limit/');
		    subroute = matches[0];
		    limit = matches[1];
		}
	    } else {
		subroute = '';
		limit = '';
	    }
	    
	    mediaGalleryEditView.render(subroute, limit);	    
	    
	},
	    
	update: function(uuid) {
	    console.log("media edit/update");
	    
	    var repository = this.__getRepository(),
		mucua = this.__getMucua(),
		mediaUpdateView = new MediaUpdateView();
	    
	    BBXFunctions.renderCommon('media');	    
	    
	    mediaUpdateView.render(uuid);	
	},

    });
    
    return Router;
});
