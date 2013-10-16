define([
    'jquery', 
    'backbone',
    'models/MediaModel', 
    'collections/media/MediaCollection',
    'views/media/MediaView',
    'views/media/MediaListView',
    'views/file/FileView'
], function($, Backbone, MediaModel, MediaCollection, MediaView, MediaListView, FileView){
    
    var AppRouter = Backbone.Router.extend({
	// rotas simples
	routes: {
	    // escopo
	    ':repository': 'getRepository',
	    ':repository/:mucua': 'getMucua',
	    ':repository/local': 'getMucuaLocal',
	    ':repository/rede': 'getMucuaRede',
	    ':repository/externo': 'getMucuaExterno',
	    
	    // bbx
	    ':repository/:mucua/bbx': 'listBbxCommands',
	    
	    // media
	    ':repository/:mucua/medias': 'publishMedia',
	    ':repository/:mucua/medias/:uuid': 'viewMedia',
	    
	    // login / logout
	    ':repository/:mucua/login': 'login',
	    ':login': 'login',
	    ':repository/:mucua/logout': 'logout',
	    ':logout': 'logout',
	},
	
	// escopo: repositório e mucuas
	getRepository: function(repository) {
	    console.log('repositorio: ' + repository);
	    console.log("/" + repository);
	},
	getMucua: function(repository, mucua) {
	    console.log("get mucua " + mucua);
	},
	getMucuaLocal: function(repository) {
	    console.log("get mucua local");
	},
	getMucuaRede: function(repository) {
	    console.log("get mucua rede");	    
	},
	getMucuaExterna: function(repository) {
	    console.log("get mucua externa");	    
	},
	
	// bbx
	listBbxCommands: function(repository, mucua) {
	    console.log("lista comndos bbx");
	    console.log("/" + repository + "/" + mucua + "/bbx");;
	},
	callBbxCommand: function(repository, mucua, command, args) {
	    console.log("executa comando " + command);
	    
	    // TODO: fazer algum tipo de lista das funcoes para pegar + dinamico
	    switch (command) {
	    case "search":
		this.buscaMedia(repository, mucua, args);
		break;
	    }
	    
	    var argsArray = args.split('/');
	    for (i in argsArray) {
		//console.log(argsArray[i]);
	    }	    
	    console.log("/" + repository + "/" + mucua + "/bbx/" + command + "/" + args);
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

	// media
	buscaMedia: function(repository, mucua, args) {
	    mensagemBusca = "Buscando '" + args + "' no repositorio '" + repository + "' e na mucua '" + mucua + "'";
	    console.log(mensagemBusca);
	    
	    url = '/api/' + repository + '/' +  mucua + '/bbx/search/' + args;
	    var mediaCollection = new MediaCollection();
	    mediaCollection.url = url;
	    mediaCollection.fetch({
		success: function() {
		    console.log("models: ", mediaCollection.models);
		    console.log("success");
		    var mediaListView = new MediaListView();
		    mediaListView.render(mediaCollection);		    
		}
	    });
	    
//	    mediaCollection.on('add', function() {
	    // outra forma de chamar a MediaListView() e .render()
//	    });
	},
	publishMedia: function(repository, mucua) {
	    console.log("insere media");
	    console.log("/" + repository + "/" + mucua + "/medias");
	    //	    var mediaView = new MediaView();
	    //	    mediaView.render();
	},
	viewMedia: function(repository, mucua, uuid) {
	    console.log("busca media " + uuid);
	    console.log("/" + repository + "/" + mucua + "/medias/" + uuid);
	    
	    var media = new MediaModel({id: uuid});
	    fetchMedia = media.fetch();
	    
	    media.on('change', function() {
		var mediaView = new MediaView({model: media});
		mediaView.render();
	    });
	}
	    
    });
    
    var initialize = function(){
	
	var router = new AppRouter();
	
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