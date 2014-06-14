var BBX = {};

define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/bbx/base-functions',
    'modules/auth/LoginView', 
], function($, Backbone, BackboneSubroute, BBXBaseFunctions, LoginView){
    var App = {};
    
    App.Router = Backbone.Router.extend({
	Routers: {},
	
	routes: {
	    '' : 'index',
	    
	    // auth
	    ':repository/:mucua/login': 'login',
	    'login': 'login',
	    ':repository/:mucua/logout': 'logout',
	    'logout': 'logout',
	    ':repository/:mucua/register': 'register',
	    'register': 'register',
	    
	    // module specific
	    ':repository/:mucua/bbx/*subroute': 'invokeBbxModule',	    
	    ':repository/:mucua/media/*subroute': 'invokeMediaModule',   
	    ':repository/:mucua/mucua/*subroute': 'invokeMucuaModule',
	    ':repository/:mucua/mocambola/*subroute': 'invokeMocambolaModule',	    
	},
	
	index: function() {
	    console.log('index');
	},
	
	login: function(repository, mucua) {
	    console.log('login');
	    var repository = repository || '',
	    mucua = mucua || '';
	    BBXBaseFunctions.init();
	    	    
	    var loginView = new LoginView();
	    loginView.render();
	},
	
	logout: function(repository, mucua) {	
	    console.log('logout');
	    var repository = repository || '',
	    mucua = mucua || '';
	},

	register: function(repository, mucua) {
	    console.log('register');
	    var repository = repository || '',
	    mucua = mucua || '';
	    
	},
	
	// media
	invokeMediaModule: function(repository, mucua, subroute) {
	    console.log('media');
	    this.Routers.MediaRouter = new MediaRouter(repository + "/" + mucua + "/" + "media/", subroute);
	},

	// mucua
	invokeMucuaModule: function(repository, mucua) {
	    console.log('mucua');
	    this.Routers.MucuaRouter = new MucuaRouter(repository + "/" + mucua + "/" + "mucua/");
	},
	
	// bbx
	invokeBbxModule: function(repository, mucua, subroute) {
	    this.Routers.BbxRouter = new BbxRouter(repository + "/" + mucua + "/" + "bbx/", subroute);
	},

	// mocambola
	invokeMocambolaModule: function(repository, mucua, subroute) {
	    console.log('mocambola');
	    this.Routers.MocambolaRouter = new MocambolaRouter(repository + "/" + mucua + "/" + "mocambola/", subroute);
	},

	// rede
	invokeRedeModule: function(repository, mucua, subroute) {
	    console.log('mocambola');
	    this.Routers.MocambolaRouter = new MocambolaRouter(repository + "/" + mucua + "/" + "mocambola/", subroute);
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