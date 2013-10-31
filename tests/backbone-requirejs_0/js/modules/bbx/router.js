define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/media/collection',
    'modules/media/MediaListView',
], function($, Backbone, Backbone_Subroute, MediaCollection, MediaListView){
    var Router = Backbone.SubRoute.extend({
	routes: {
	    // bbx
	    'list': 'listBbxCommands',
	    'search/:args': 'busca',
	},
	
	initialize: function() {
	    console.log("module BBX loaded");
	},

	listBbxCommands: function() {
	    console.log("lista comandos bbx");
	},
	
	getRepository: function() {
	    var argsArray = this.prefix.split('/');
	    return argsArray[0];
	},

	getMucua: function() {
	    var argsArray = this.prefix.split('/');
	    return argsArray[1];
	},

	busca: function(args) {
	    console.log("busca args:");
	    repository = this.getRepository();
	    mucua = this.getMucua();
	    
	    mensagemBusca = "Buscando '" + args + "' no repositorio '" + repository + "' e na mucua '" + mucua + "'";
	    console.log(mensagemBusca);
	    
	    url = '/api/' + repository + '/' +  mucua + '/bbx/search/' + args;
	    var mediaCollection = new MediaCollection([], {url: url});
	    
	    mediaCollection.fetch({
		success: function() {
		    var mediaListView = new MediaListView();
		    mediaListView.render(mediaCollection);		    
		}
	    });
	}
	
    });
    
    return Router;
});