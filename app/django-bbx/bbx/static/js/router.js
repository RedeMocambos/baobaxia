var BBX = {};

define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/bbx/base-functions',
    'views/auth/LoginView', 
    'views/auth/LogoutView',
    'views/common/IndexView',  
    'modules/mucua/router',
    'modules/repository/router',
    'modules/media/router',
    'modules/bbx/router',
    'modules/mocambola/router',
], function($, Backbone, BackboneSubroute, BBXBaseFunctions, LoginView, LogoutView, IndexView, MucuaRouter, RepositoryRouter, MediaRouter, BBXRouter, MocambolaRouter){
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
	    ':repository': 'invokeRepositoryModule',
	    ':repository/': 'invokeRepositoryModule',
	    ':repository/list': 'invokeRepositoryModule',
	    ':repository/mucuas': 'invokeRepositoryModule',
	    ':repository/:mucua/bbx/*subroute': 'invokeBbxModule',	    
	    ':repository/:mucua/mocambola/*subroute': 'invokeMocambolaModule',
	    ':repository/:mucua/bbx/*subroute': 'invokeBbxModule',	    
	    ':repository/:mucua/media': 'invokeMediaModule',   
	    ':repository/:mucua/media/*subroute': 'invokeMediaModule',   
	    ':repository/:mucua/mucua/*subroute': 'invokeMucuaModule',
	    ':repository/:mucua/*subroute': 'invokeMucuaModule',
	    ':repository/:mucua': 'invokeMucuaModule',
	},

	
	__parseHeader: function() {
	},

	index: function() {
	    console.log('index');
	    $('body').removeClass().addClass('home');
	    var indexView = new IndexView();
	    indexView.render();
	    
	    var urlRedirect = "/#login";
	    window.location.href = urlRedirect;
	},
	
	login: function(repository, mucua) {
	    var repository = repository || '',
	    mucua = mucua || '';	    
	    console.log('login');
	    
	    if (!BBXBaseFunctions.isLogged()) {
		// undelegate elements // TODO: achar uma solucao mais elegante
		$('body').off();
		var loginView = new LoginView();
		loginView.render();
	    } else {
		// redirect to home
		var urlRedirect = BBXBaseFunctions.getDefaultHome();
		window.location.href = urlRedirect;
	    }
	},
	
	logout: function(repository, mucua) {
	    var repository = repository || '',
	    mucua = mucua || '',
	    urlRedirect = '#login',
	    logoutView = new LogoutView();
	    logoutView.doLogout();
	    console.log('logout');
	    
	    $('body').removeClass().addClass('home');
	    
	    // redirect
	    window.location.href = urlRedirect;
	},

	register: function(repository, mucua) {
	    var repository = repository || '',
	    mucua = mucua || '';
	    console.log('register');
	},
	
	// media
	invokeMediaModule: function(repository, mucua, subroute) {
	    console.log('media');
	    BBXBaseFunctions.setNavigationVars(repository, mucua, subroute);
	    this.Routers.MediaRouter = new MediaRouter(repository + "/" + mucua + "/media/", subroute);
	},

	// repository
	invokeRepositoryModule: function(repository) {
	    var subroute = window.location.hash.split('/')[1];
	    console.log('repository');
	    console.log('subroute: ' + subroute);
	    BBXBaseFunctions.setNavigationVars(repository, '', subroute);
	    this.Routers.RepositoryRouter = new RepositoryRouter(repository, subroute);
	},

	// mucua
	invokeMucuaModule: function(repository, mucua, subroute) {
	    var subroute = subroute || '';
	    console.log('mucua');
	    BBXBaseFunctions.setNavigationVars(repository, mucua, subroute);
	    this.Routers.MucuaRouter = new MucuaRouter(repository + "/" + mucua + "/", subroute);
	},
	
	// mocambola
	invokeMocambolaModule: function(repository, mucua, subroute) {
	    console.log('mocambola:::::::::');
	    console.log(subroute);
	    
	    BBXBaseFunctions.setNavigationVars(repository, mucua, subroute);
	    this.Routers.MocambolaRouter = new MocambolaRouter(repository + "/" + mucua + "/mocambola/", subroute);
	},
	
	// bbx
	invokeBbxModule: function(repository, mucua, subroute) {
	    console.log('bbx');
	    
	    BBXBaseFunctions.setNavigationVars(repository, mucua, subroute);
	    this.Routers.BbxRouter = new BBXRouter(repository + "/" + mucua + "/bbx/", subroute);
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