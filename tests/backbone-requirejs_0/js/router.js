define([
    'jquery', 
    'backbone',
    'views/media/MediaView'
], function($, Backbone, MediaView){
    
    var AppRouter = Backbone.Router.extend({
	routes: {
	    // default
	    '': 'MediaView'
	}
    });
    	    console.log('abc');
    var initialize = function(){
	var app_router = new AppRouter;
	
	// default
	app_router.on('route:MediaView', function() {
	    var mediaView = new MediaView();
	    mediaView.render();
	});	
	Backbone.history.start();
    };
    return {
	initialize: initialize
    };
});