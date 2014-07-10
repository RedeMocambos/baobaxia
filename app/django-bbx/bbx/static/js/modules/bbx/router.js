define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/bbx/base-functions',
    'views/bbx/Search',
], function($, Backbone, Backbone_Subroute, BBXBaseFunctions, Search){
    var Router = Backbone.SubRoute.extend({
	routes: {
	    // bbx
	    'search': 'search',
	    'search/': 'search',
	    'search/*subroute': 'search',
	},
	
	initialize: function() {
	    console.log("module BBX loaded");
	},
	
	// tem que ter esse por conta da navegacao / atualizacao
	__getRepository: function() {
	    return this.prefix.split('/')[0];
	},
	__getMucua: function() {
	    return this.prefix.split('/')[1];
	},
	__getSubroute: function() {
	    return this.prefix.match(/\w+\/\w+\/$/i)[0];
	},

	search: function(subroute) {
	    var subroute = subroute || '',
	    completeSubroute = '',
	    config = $("body").data("bbx").config,
	    repository = this.__getRepository(),
	    mucua = this.__getMucua();
	    
	    if (config.subroute.match(/search/)) {
		completeSubroute = 'bbx/search/' + subroute;
	    }
	    
	    BBXBaseFunctions.setNavigationVars(repository, mucua, completeSubroute);	    
	    BBXBaseFunctions.renderCommon('bbx');
	    var search = new Search();
	    search.render(subroute);
	},
    });
    
    return Router;
});