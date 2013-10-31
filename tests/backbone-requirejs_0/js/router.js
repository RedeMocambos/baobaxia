define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/media/router', 
    'modules/mucua/router', 
    'modules/bbx/router', 
], function($, Backbone, BackboneSubroute, MediaRouter, MucuaRouter, BbxRouter){
    var App = {};
    
    App.Router = Backbone.Router.extend({
	Routers: {},
	
	routes: {
	    // login / logout
	    ':repository/:mucua/login': 'login',
	    ':login': 'login',
	    ':repository/:mucua/logout': 'logout',
	    ':logout': 'logout',

	    // module specific
	    ':repository/:mucua/bbx/*subroute': 'invokeBbxModule',
	    ':repository/:mucua/media/*subroute': 'invokeMediaModule',   
	    ':repository/:mucua/mucua/*subroute': 'invokeMucuaModule',
	},

	// login / logout
	login: function(repository='', mucua='') {
	    console.log("login");
	    if (repository != "" && mucua != "") {
		console.log("/" + repository + "/" + mucua + "/login");;
	    } else if (repository == "" && mucua === "") {
		console.log("/login");
	    }
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
		this.Routers.BbxRouter = new BbxRouter(repository + "/" + mucua + "/" + "bbx/");
	    }
	},
	
//	    var argsArray = args.split('/');
//	    for (i in argsArray) {
		//console.log(argsArray[i]);
//	    }	    
	    //console.log("/" + repository + "/" + mucua + "/bbx/" + command + "/" + args);
	    
    });
    
    var initialize = function(){
	
	new App.Router();
/*	
	// rotas RegExp
	routes = [
	    // bbx [command] com multiplos argumentos
	    // /[repo]/[mucua]/bbx/[comando]/[arg1|arg2|...]
	    [/^(.+?)\/(.+?)\/bbx\/(.+?)\/(.*?)$/, 'callBbxCommand', this.callBbxCommand],
	    // search generico
	    //	    [/^(.+?)\/(.+?)\/(.+?)$/, 'buscaMedia', this.buscaMedia],
	    // TODO: consertar conflito entre essa func e a /repo/mucua/medias/uuid
	];
	_.each(routes, function(route) {
	    router.route.apply(router,route);
        });
*/
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