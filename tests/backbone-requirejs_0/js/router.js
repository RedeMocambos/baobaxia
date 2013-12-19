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
	data: {'repository': '', 'mucua': ''},
	
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
	    
	    _.extend(this.data, Backbone.Events);
	    
	    this.renderCommon();
	    this.on("route", function(event) {
		var indexView = new IndexView();
		indexView.render();
	    });
	},
	
	renderCommon: function() {
	    // carrega partes comuns
	    console.log("common");
	    
	    var data = {};
	    var defaultRepository = new RepositoryModel([], {url: '/api/repository/'});
	    var defaultMucua = new MucuaModel([], {url: '/api/mucua/'});
	    
	    defaultRepository.fetch({
		success: function() {
		    data.repository = defaultRepository.attributes[0].name;
		}
	    });
	    defaultMucua.fetch({
		success: function() {
		    data.mucua = defaultMucua.attributes[0].description;
		    
		    var headerView = new HeaderView();
		    headerView.render(data);
		    
		    var footerView = new FooterView();
		    footerView.render(data);
		    
		    this.data = data;
		}
	    });
	},	
	
	// login
	login: function(repository='', mucua='') {
	    console.log("login");

	    this.renderCommon();
	    
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
	    this.renderCommon();
	    
	    if (!this.Routers.MediaRouter) {
		this.Routers.MediaRouter = new MediaRouter(repository + "/" + mucua + "/" + "media/", subroute);
	    }
	},

	// mucua
	invokeMucuaModule: function(repository, mucua) {
	    this.renderCommon();
	    
	    if (!this.Routers.MucuaRouter) {
		this.Routers.MucuaRouter = new MucuaRouter(repository + "/" + mucua + "/" + "mucua/");
	    }
	},
	
	// bbx
	invokeBbxModule: function(repository, mucua, subroute) {
	    this.renderCommon();
	    
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