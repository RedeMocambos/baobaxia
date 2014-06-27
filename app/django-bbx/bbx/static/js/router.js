var BBX = {};

define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/bbx/base-functions',
    'modules/auth/LoginView', 
    'modules/mucua/router',
    'text!templates/common/content.html',
], function($, Backbone, BackboneSubroute, BBXBaseFunctions, LoginView, MucuaRouter, ContentTpl){
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
	    ':repository/:mucua/*subroute': 'invokeMucuaModule',
	    ':repository/:mucua': 'invokeMucuaModule',
	    ':repository/:mucua/mocambola/*subroute': 'invokeMocambolaModule',	    
	},

	__parseHeader: function() {
	},

	index: function() {
	    console.log('index');
	},
	
	login: function(repository, mucua) {
	    console.log('login');
	    var repository = repository || '',
	    mucua = mucua || '';

	    if (!BBXBaseFunctions.isLogged()) {
		$('#content').html('aguarde, carregando...');		
		var loginView = new LoginView();
		loginView.render();
	    } else {
		// redirect to home
		var urlRedirect = BBXBaseFunctions.getDefaultHome();
		window.location.href = urlRedirect;
	    }
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
	invokeMucuaModule: function(repository, mucua, subroute) {
	    var subroute = subroute || '';
	    console.log('mucua');
	    BBXBaseFunctions.renderCommon();
	    this.Routers.MucuaRouter = new MucuaRouter(repository + "/" + mucua + "/" + subroute);
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
    
    var __loadConfig = function(callback) {
	// loads bbx configs
	BBXBaseFunctions.init();

    };    
    
    var initialize = function(){
	BBXBaseFunctions.init();
	// waits for bbx init() in order to load navigation and routing
	var loadConfigs = setInterval(function() {
	    if ($("body").data("bbx").configLoaded === true) {
		new App.Router();
		Backbone.history.start();		
		clearInterval(loadConfigs);		
	    }
	}, 30);
    };

    return {
	initialize: initialize
    };    
});