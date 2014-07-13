define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/bbx/base-functions',
    'views/bbx/Search',
    'views/network/HomeNetwork'
], function($, Backbone, Backbone_Subroute, BBXBaseFunctions, Search, HomeNetwork){
    var Router = Backbone.SubRoute.extend({
	routes: {
	    '*': 'homeNetwork',
	    'bbx/search/': 'homeNetwork',
	    'bbx/search/*subroute': 'homeNetwork',
	},
	
	homeNetwork: function(subroute) {
	    var subroute = subroute || '';
	    BBXBaseFunctions.renderCommon('bbx');
	    var homeNetwork = new HomeNetwork();
	    homeNetwork.render(subroute);
	},
    });
    
    return Router;
});