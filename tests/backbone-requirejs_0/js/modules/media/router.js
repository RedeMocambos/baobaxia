define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/media/model', 
    'modules/media/collection',
    'modules/media/MediaView',
    'modules/media/MediaListView',
], function($, Backbone, Backbone_Subroute, MediaModel, MediaCollection, MediaView, MediaListView){
    var Router = Backbone.SubRoute.extend({
	routes: {
	    // media
	    'medias': 'publishMedia',
	    'medias/:uuid': 'viewMedia',
	},
	
	// (OLD)
	publishMedia: function(repository, mucua) {
	    console.log("insere media");
	    console.log("/" + repository + "/" + mucua + "/medias");
	    //	    var mediaView = new MediaView();
	    //	    mediaView.render();
	},
	
	// (OLD)
	viewMedia: function(repository, mucua, uuid) {
	    console.log("busca media " + uuid);
	    console.log("/" + repository + "/" + mucua + "/medias/" + uuid);
	    
	    var media = new MediaModel({id: uuid});
	    fetchMedia = media.fetch();
	    
	    media.on('change', function() {
		var mediaView = new MediaView({model: media});
		mediaView.render();
	    });
	}    
    });
    
    return Router;
});