define([
    'jquery', 
    'backbone',
    'models/FileModel', 
    'views/media/MediaView',
    'views/file/FileView'
], function($, Backbone, FileModel, MediaView, FileView){

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
	    ':repository/:mucua/media': 'publishMedia',
	    ':repository/:mucua/media/:uuid': 'viewMedia',
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
	    
	    var argsArray = args.split('/');   
	    for (i in argsArray) {
		console.log(argsArray[i]);
	    }
	    
	    console.log("/" + repository + "/" + mucua + "/bbx/" + command + "/" + args);
	},
	
	buscaMedia: function(repository, mucua, args) {
	    console.log("busca " + args);
	},
	
	// media
	publishMedia: function(repository, mucua) {
	    console.log("insere media");
	    console.log("/" + repository + "/" + mucua + "/media");
	    //	    var mediaView = new MediaView();
	    //	    mediaView.render();
	},
	viewMedia: function(repository, mucua, uuid) {
	    console.log("busca media");
	    console.log("/" + repository + "/" + mucua + "/media/" + uuid);
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
	    [/^(.+?)\/(.+?)\/(.+?)$/, 'buscaMedia', this.buscaMedia],
	];
	_.each(routes, function(route) {
	    router.route.apply(router,route);
        });

	Backbone.history.start();
    };

    return {
	initialize: initialize
    };    
    
    /*	
    // old	
    app_router.on('route:MediaView', function() {
    var mediaView = new MediaView();
    mediaView.render();
    });
    
    // file/:filename
    app_router.on('route:getFile', function(fileName) {
    var file1 = new FileModel({'filename': fileName});
    fetchFile = file1.fetch();
    
    file1.on('change', function() {
    var fileView = new FileView({model: file1});
    fileView.render();
    });   
    });
    */	
});