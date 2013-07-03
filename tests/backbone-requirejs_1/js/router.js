define([
    'jquery', 
    'underscore',
    'backbone',
    'views/HomeView'
], function($, _, Backbone, HomeView){
    var AppRouter = Backbone.Router.extend({
	routes: {
	    // default
	    '': 'Home'
	}
    });
    
    var initialize = function(){
	var app_router = new AppRouter;
	
	// default
	app_router.on('route:Home', function() {
	    var homeView = new HomeView();
	    homeView.render();
	});
	
	Backbone.history.start();
    };
    return {
	initialize: initialize
    };
});