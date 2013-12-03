define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/media/router', 
    'modules/mucua/router', 
    'modules/bbx/router', 
    'modules/auth/LoginView', 
], function($, Backbone, BackboneSubroute, MediaRouter, MucuaRouter, BbxRouter, LoginView){
    var App = {};
    
    App.Router = Backbone.Router.extend({
	Routers: {},
	
	routes: {
	    '' : 'index',
	    
	    // login / logout
	    ':repository/:mucua/login': 'login',
	    'login': 'login',
	    ':repository/:mucua/logout': 'logout',
	    'logout': 'logout',

	    // module specific
	    ':repository/:mucua/bbx/*subroute': 'invokeBbxModule',	    
	    ':repository/:mucua/media/*subroute': 'invokeMediaModule',   
	    ':repository/:mucua/mucua/*subroute': 'invokeMucuaModule',
	},

	index: function() {
	    console.log("index");
	    
	},	
	
	// login
	login: function(repository='', mucua='') {
	    console.log("login");
	    if (repository != "" && mucua != "") {
		console.log("/" + repository + "/" + mucua + "/login");;
	    } else if (repository == "" && mucua === "") {
		console.log("/login");
	    }
	    
	    var loginView = new LoginView();
	    loginView.render();
	},
	logout: function(repository='', mucua='') {	
	    console.log("/logout");
	},
	
	// media
	invokeMediaModule: function(subroute) {
	    if (!this.Routers.MediaRouter) {
		this.Routers.MediaRouter = new MediaRouter(repository + "/" + mucua + "/" + "media/");
	    }
	},

	// mucua
	invokeMucuaModule: function(repository, mucua) {
	    if (!this.Routers.MucuaRouter) {
		this.Routers.MucuaRouter = new MucuaRouter(repository + "/" + mucua + "/" + "mucua/");
	    }
	},
	
	// bbx
	invokeBbxModule: function(repository, mucua, subroute) {
	    if (!this.Routers.BbxRouter) {
		this.Routers.BbxRouter = new BbxRouter(repository + "/" + mucua + "/" + "bbx/", subroute);
	    }
	},
	
    });
    
    var initialize = function(){
	
	new App.Router();
	Backbone.history.start();
    };

    return {
	initialize: initialize
    };    
});

// event detection:
// mediaCollection.on('all', function(eventName) {
// 	console.log("eventName: " + eventName);
// });	    