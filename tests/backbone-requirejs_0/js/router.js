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

	app_router.on('route:getFile', function(fileName) {
	    var file1 = new FileModel({filename: fileName});
//	    console.log(file1.get('path'));
//	    console.log(file1.get('filename'));
	    fetchFile = file1.fetch({
		success: function() {
                    console.log('ok!');
		}
            });
	    console.log(fetchFile);

	    var fileView = new FileView();
	    fileView.render();
	});
	
	Backbone.history.start();
    };
    return {
	initialize: initialize
    };
});