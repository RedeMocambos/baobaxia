var BBX = {},
    userLang = '';
if (typeof BBX.config === 'undefined') {
    userLang = navigator.language || navigator.userLanguage;
} else {
    userLang = BBX.config.userLang;
}
// normalize language code from 'xx-xx', 'xx_xx' or whatelse to 'xx_XX'
var reLang = /([a-zA-Z]{2})[\-\_]([a-zA-Z]{2})/;
var reMatches = userLang.match(reLang);
userLang = reMatches[1] + '_' + reMatches[2].toUpperCase();
define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/bbx/functions',
    'views/auth/LoginView', 
    'views/auth/LogoutView',
    'views/auth/RegisterView', 
    'views/common/IndexView',  
    'views/common/SobreView',  
    'modules/mucua/router',
    'modules/repository/router',
    'modules/media/router',
    'modules/bbx/router',
    'modules/mocambola/router',
], function($, Backbone, BackboneSubroute, BBXFunctions, LoginView, LogoutView, RegisterView, IndexView, SobreView, MucuaRouter, RepositoryRouter, MediaRouter, BBXRouter, MocambolaRouter){
    var App = {};
    App.Router = Backbone.Router.extend({
	Routers: {},
	
	routes: {
	    '' : 'index',
	    'sobre' : 'sobre',
	    
	    // auth
	    ':repository/:mucua/login': 'login',
	    'login': 'login',
	    ':repository/:mucua/logout': 'logout',
	    'logout': 'logout',
	    ':repository/:mucua/register': 'register',
	    'register': 'register',
	    'registrar': 'register',
	    
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
	    
	    var loadConfigs = setInterval(function() {
		if ($("body").data("bbx").configLoaded === true) {
		    var config = $("body").data("bbx").config,
		    urlRedirect = config.interfaceUrl + config.MYREPOSITORY + "/" + config.MYMUCUA;
		    
		    window.location.href = urlRedirect;
		    clearInterval(loadConfigs);
		}
	    }, 50);  
	},
	
	sobre: function() {
	    var sobreView = new SobreView();
	    sobreView.render();
	},
	
	login: function(repository, mucua) {
	    var repository = repository || '',
	    mucua = mucua || '';	    
	    console.log('login');
	    
	    if (!BBXFunctions.isLogged()) {
		// undelegate elements // TODO: achar uma solucao mais elegante
		$('body').off();
		var loginView = new LoginView();
		loginView.render();
	    } else {
		// redirect to home
		var urlRedirect = BBXFunctions.getDefaultHome();
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

	    var registerView = new RegisterView();
	    registerView.render();
	},
	
	// media
	invokeMediaModule: function(repository, mucua, subroute) {
	    console.log('media');
	    BBXFunctions.setNavigationVars(repository, mucua, subroute);
	    this.Routers.MediaRouter = new MediaRouter(repository + "/" + mucua + "/media/", subroute);
	},

	// repository
	invokeRepositoryModule: function(repository) {
	    var subroute = window.location.hash.split('/')[1];
	    console.log('repository');
	    console.log('subroute: ' + subroute);
	    BBXFunctions.setNavigationVars(repository, '', subroute);
	    this.Routers.RepositoryRouter = new RepositoryRouter(repository, subroute);
	},

	// mucua
	invokeMucuaModule: function(repository, mucua, subroute) {
	    var subroute = subroute || '';
	    console.log('mucua');
	    BBXFunctions.setNavigationVars(repository, mucua, subroute);
	    this.Routers.MucuaRouter = new MucuaRouter(repository + "/" + mucua + "/", subroute);
	},
	
	// mocambola
	invokeMocambolaModule: function(repository, mucua, subroute) {
	    console.log('mocambola:::::::::');
	    console.log(subroute);
	    
	    BBXFunctions.setNavigationVars(repository, mucua, subroute);
	    this.Routers.MocambolaRouter = new MocambolaRouter(repository + "/" + mucua + "/mocambola/", subroute);
	},
	
	// bbx
	invokeBbxModule: function(repository, mucua, subroute) {
	    console.log('bbx');
	    
	    BBXFunctions.setNavigationVars(repository, mucua, subroute);
	    this.Routers.BbxRouter = new BBXRouter(repository + "/" + mucua + "/bbx/", subroute);
	},

    });
    
    var __loadConfig = function(callback) {
	// loads bbx configs
	BBXFunctions.init();

    };    
    
    var initialize = function(){
	BBXFunctions.init();
	// waits for bbx init() in order to load navigation and routing
	var loadConfigs = setInterval(function() {
	    if ($("body").data("bbx").configLoaded === true) {
		new App.Router();
		if (Backbone.history.handlers.length !== true) {
		    Backbone.history.start();
		}		
		clearInterval(loadConfigs);		
	    }
	}, 30);
    };

    return {
	initialize: initialize
    };    
});
