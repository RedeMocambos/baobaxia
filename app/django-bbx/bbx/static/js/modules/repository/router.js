define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/bbx/base-functions',
    'modules/repository/model',
    'views/repository/HomeRepository',
    'views/repository/ListMucuas',
], function($, Backbone, BackboneSubroute, BBXBaseFunctions, RepositoryModel, HomeRepository, ListMucuas){
    var Router = Backbone.SubRoute.extend({
	routes: {
	    'mucuas' : 'listMucuas',
	    '*' : 'homeRepository',
	},

	initialize: function() {
	    console.log("module repository loaded");
	},

	__getRepository: function() {
	    return this.prefix.split('/')[0];
	},
	
	homeRepository: function() {	    
	    console.log("home repository");
	    
	    //var repository = this.__getRepository(),
	    //mucua = '',
	    var homeRepository = new HomeRepository(); 
	    homeRepository.render();
	},
	
	listMucuas: function() {
	    console.log("list mucuas of repository");
	    var listMucuas = new ListMucuas(); 
	    listMucuas.render();
	}
    });
    
    return Router;
});
