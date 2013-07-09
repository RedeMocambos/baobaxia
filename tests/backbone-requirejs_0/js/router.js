define([
    'jquery', 
    'backbone',
    'models/FileModel', 
    'views/media/MediaView',
    'views/file/FileView'
], function($, Backbone, FileModel, MediaView, FileView){
    
    var AppRouter = Backbone.Router.extend({
	routes: {
	    // default
	    '': 'MediaView',
	    'file/:filename': 'getFile'
	}
    });
    
    var initialize = function(){
	var app_router = new AppRouter;
	
	// default
	app_router.on('route:MediaView', function() {
	    var mediaView = new MediaView();
	    mediaView.render();
	});
	
	// file/:filename
	app_router.on('route:getFile', function(fileName) {
	    var file1 = new FileModel({'filename': fileName});
	    fetchFile = file1.fetch();
	    
	    file1.on('change', function() {
		var fileView = new FileView({model: file1});
		fileView.render();
	    });   
	});
	
	Backbone.history.start();
    };
    return {
	initialize: initialize
    };
});