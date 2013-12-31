define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/bbx/base-functions',
    'modules/media/router', 
    'modules/mucua/router', 
    'modules/bbx/router', 
    'modules/mucua/model',
    'modules/repository/model',
    'modules/common/HeaderView',
    'modules/common/FooterView',
    'modules/auth/LoginView', 
    'modules/common/IndexView', 
], function($, Backbone, BackboneSubroute, BBXBaseFunctions, MediaRouter, MucuaRouter, BbxRouter, MucuaModel, RepositoryModel, HeaderView, FooterView, LoginView, IndexView){
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
	    BBXBaseFunctions.renderCommon();
	    
	    $("body").data("data").on("changedData", function() {
		var indexView = new IndexView();
		indexView.render($("body").data("data"));
	    });
	},
	
	// login
	login: function(repository='', mucua='') {
	    console.log("login");
	    
	    BBXBaseFunctions.renderCommon(repository, mucua);
	    
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
	invokeMediaModule: function(repository, mucua, subroute) {
	    BBXBaseFunctions.renderCommon(repository, mucua);
	    
	    if (!this.Routers.MediaRouter) {
		this.Routers.MediaRouter = new MediaRouter(repository + "/" + mucua + "/" + "media/", subroute);
	    }
	},

	// mucua
	invokeMucuaModule: function(repository, mucua) {
	    BBXBaseFunctions.renderCommon(repository, mucua);
	    
	    if (!this.Routers.MucuaRouter) {
		this.Routers.MucuaRouter = new MucuaRouter(repository + "/" + mucua + "/" + "mucua/");
	    }
	},
	
	// bbx
	invokeBbxModule: function(repository, mucua, subroute) {
	    BBXBaseFunctions.renderCommon(repository, mucua);
	    
	    if (!this.Routers.BbxRouter) {
		this.Routers.BbxRouter = new BbxRouter(repository + "/" + mucua + "/" + "bbx/", subroute);
	    }
	},
    });
    
    var initialize = function(){
	// inicializa
	//console.log('initialize');
	
	// adiciona suporte a eventos para qualquer dado armazenado no "body"
	$("body").data("data", {repository: '', mucua: ''});	
	_.extend($("body").data("data"), Backbone.Events);
	
	new App.Router();
	Backbone.history.start();
    };

    return {
	initialize: initialize
    };    
});