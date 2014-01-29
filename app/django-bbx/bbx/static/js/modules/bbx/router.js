define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/bbx/base-functions',
    'modules/media/collection',
    'modules/media/BuscaView',
    'text!templates/common/header.html',
    'text!templates/common/footer.html',
], function($, Backbone, Backbone_Subroute, BBXBaseFunctions, MediaCollection, BuscaView, Header, Footer){
    var Router = Backbone.SubRoute.extend({
	routes: {
	    // bbx
	    'list': 'listBbxCommands',
	    'search/': 'busca',
	    'search/*subroute': 'busca',
	},
	
	initialize: function() {
	    console.log("module BBX loaded");
	},

	_getRepository: function() {
	    return this.prefix.split('/')[0];
	},

	_getMucua: function() {
	    return this.prefix.split('/')[1];
	},

	_getSubroute: function() {
	    return this.prefix.match(/\w+\/\w+\/$/i)[0];
	},
	
	// funcoes de mapeamento
	listBbxCommands: function() {
	    console.log("lista comandos bbx");
	},
	
	busca: function(subroute) {
	    subroute = subroute || '';
	    repository = this._getRepository();
	    mucua = this._getMucua();
	    BBXBaseFunctions.renderCommon(repository, mucua);
	    
	    var buscaView = new BuscaView();
	    buscaView.render(subroute);
	},	
    });
    
    return Router;
});