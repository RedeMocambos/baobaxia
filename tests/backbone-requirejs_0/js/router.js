define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/media/router', 
    'modules/mucua/router', 
    'modules/bbx/router', 
    'modules/mucua/model',
    'modules/repository/model',
    'modules/common/HeaderView',
    'modules/common/FooterView',
    'modules/auth/LoginView', 
    'modules/common/IndexView', 
], function($, Backbone, BackboneSubroute, MediaRouter, MucuaRouter, BbxRouter, MucuaModel, RepositoryModel, HeaderView, FooterView, LoginView, IndexView){
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
	    this._renderCommon();	    
	    
	    $("body").data("data").on("changedData", function() {
		var indexView = new IndexView();
		indexView.render($("body").data("data"));
	    });
	    //TODO: criar um evento (q funcione) para so carregar a index quando dados tiverem sido carregador pela renderCommon
	},
	
	_renderCommon: function() {
	    // carrega partes comuns
	    console.log("common");
	    
	    var defaultRepository = new RepositoryModel([], {url: '/api/repository/'});
	    var defaultMucua = new MucuaModel([], {url: '/api/mucua/'});
	    
	    defaultRepository.fetch({
		success: function() {
		    $("body").data("data").repository = defaultRepository.attributes[0].name;
		    
		    defaultMucua.fetch({
			success: function() {
			    $("body").data("data").mucua = defaultMucua.attributes[0].description;
			    $("body").data("data").trigger("changedData");
			    
			    var headerView = new HeaderView();
			    headerView.render($("body").data("data"));
			    
			    var footerView = new FooterView();
			    footerView.render($("body").data("data"));
			}
		    });
		}
	    });
	},	
	
	// login
	login: function(repository='', mucua='') {
	    console.log("login");

	    this._renderCommon();
	    
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
	    this._renderCommon();
	    
	    if (!this.Routers.MediaRouter) {
		this.Routers.MediaRouter = new MediaRouter(repository + "/" + mucua + "/" + "media/", subroute);
	    }
	},

	// mucua
	invokeMucuaModule: function(repository, mucua) {
	    this._renderCommon();
	    
	    if (!this.Routers.MucuaRouter) {
		this.Routers.MucuaRouter = new MucuaRouter(repository + "/" + mucua + "/" + "mucua/");
	    }
	},
	
	// bbx
	invokeBbxModule: function(repository, mucua, subroute) {
	    this._renderCommon();
	    
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

// event detection:
// mediaCollection.on('all', function(eventName) {
// 	console.log("eventName: " + eventName);
// });	    