define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/bbx/base-functions',
    'modules/media/model', 
    'modules/media/collection',
    'modules/media/MediaView',
], function($, Backbone, Backbone_Subroute, BBXBaseFunctions, MediaModel, MediaCollection, MediaView){
    var Router = Backbone.SubRoute.extend({
	routes: {
	    // media
	    '': 'publish',
	    ':uuid': 'view',
	},
	
	initialize: function() {
	    console.log("module Media loaded");
	},

	_getRepository: function() {
	    return this.prefix.split('/')[0];
	},

	_getMucua: function() {
	    return this.prefix.split('/')[1];
	},

	publish: function(repository, mucua) {
	    console.log("insere media");
	    console.log("/" + repository + "/" + mucua + "/medias");
	    //	    var mediaView = new MediaView();
	    //	    mediaView.render();
	},
	
	view: function(uuid) {
	    console.log("visualiza media");
	    repository = this._getRepository();
	    mucua = this._getMucua();
	    BBXBaseFunctions.renderCommon(repository, mucua);
	    
	    var mediaView = new MediaView();
	    mediaView.render(uuid);
	},    
    });
    
    return Router;
});