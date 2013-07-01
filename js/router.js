define([
    'jquery', 
    'underscore', 
    'backbone',
    'views/medias/list'
/*    'views/users/list'*/
], function($, _, Backbone, MediaListView, UserListView){
    
    var AppRouter = Backbone.Router.extend({
	routes: {
	    // default
	    '*': 'showMedias',
	    // other routes
/*	    '/medias' : 'showMedias',*/
/*	    '/users' : 'showUsers',*/
	},
    });
    
    var initialize = function(){
	var app_router = new AppRouter;
	
	// views/medias/list
	app_router.on('showMedias', function() {
	    var mediaListView = new MediaListView();
	    mediaListView.render();
	});
/*
	// views/user/list
	app_router.on('showUsers', function() {
	    var userListView = new UserListView();
	    userListView.render();
	});
*/	
	app_router.on('defaultAction', function(actions){
	    // We have no matching route, lets just log what the URL was
	    console.log('No route:', actions);
	});
	Backbone.history.start();
    };
    return {
	initialize: initialize
    };
});