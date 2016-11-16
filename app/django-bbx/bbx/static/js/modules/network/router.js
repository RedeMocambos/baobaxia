define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'views/bbx/Search',
    'views/network/HomeNetwork'
], function($, Backbone, Backbone_Subroute, Search, HomeNetwork){
    var Router = Backbone.SubRoute.extend({
	routes: {
	    '*': 'homeNetwork',
	    'bbx/search/': 'homeNetwork',
	    'bbx/search/*subroute': 'homeNetwork',
	},
	
	homeNetwork: function(subroute) {
	    var subroute = subroute || '',
	    completeSubroute = '',
	    config = BBX.config,
	    repository = this.__getRepository(),
	    mucua = this.__getMucua();
	    
	    if (config.subroute.match(/search/)) {
		completeSubroute = 'bbx/search/' + subroute;
	    }

	    BBXFunctions.setNavigationVars(repository, mucua, completeSubroute);
	    BBXFunctions.renderCommon('bbx');
	    var homeNetwork = new HomeNetwork();
	    homeNetwork.render(subroute);
	    
	    // TODO: pensar numa forma de fazer dessa uma funcao q chame bbx/search mas q identifique
	    // se a mucua eh rede ou q, e faca sidebar dessa forma.
	},
    });
    
    return Router;
});
