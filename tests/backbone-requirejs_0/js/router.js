define([
    'jquery', 
    'backbone',
    'models/FileModel', 
    'views/media/MediaView',
    'views/file/FileView'
], function($, Backbone, FileModel, FileCollection, MediaView, FileView){
    
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
	    var file1 = new FileModel({'filename': fileName});
	    
	    fetchFile = file1.fetch();
	    
/*
		success: function(data){
		    console.log(JSON.stringify(data));
                    console.log('ok!');
		},
		error: function(data){
		    console.log("erro: " + data);
		    console.log(JSON.stringify(data));
		}
            });
*/
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