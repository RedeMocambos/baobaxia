define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/bbx/base-functions',
    'views/bbx/HomeNetwork'
], function($, Backbone, Backbone_Subroute, BBXBaseFunctions, HomeNetwork){
    var Router = Backbone.SubRoute.extend({
	routes: {
	    // bbx
	    'search/': 'busca',
	    'search/*subroute': 'busca',
	},
	
	initialize: function() {
	    console.log("module BBX loaded");
	},
	
	busca: function(subroute) {
	    var subroute = subroute || '';
	    BBXBaseFunctions.renderCommon('bbx');
	    
	    var homeNetwork = new HomeNetwork();
	    homeNetwork.render(subroute);
	},	
    });
    
    return Router;
});