define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/bbx/functions',
    'views/bbx/Search',
], function($, Backbone, Backbone_Subroute, BBXFunctions, Search){
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
		mucua = this.__getMucua(),
		search = new Search();
	    
	    if (config.subroute.match(/search/)) {
		completeSubroute = 'bbx/search/' + subroute;
	    }
	    console.log("completeSubroute: " + completeSubroute);
	    BBXFunctions.setNavigationVars(repository, mucua, completeSubroute);	    
	    BBXFunctions.renderCommon('bbx ' + mucua);

	    search.render(subroute);
	},
    });
    
    return Router;
});
