define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/repository/model',
    'views/repository/HomeRepository',
    'views/repository/ListMucuas',
], function($, Backbone, BackboneSubroute, RepositoryModel, HomeRepository, ListMucuas){
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
	    
	    var homeRepository = new HomeRepository();

	    BBXFunctions.setNavigationVars(repository, 'rede');
	    BBXFunctions.renderCommon('mocambola');
	    
	    homeRepository.render();
	},
	
	listMucuas: function() {
	    console.log("list mucuas of repository");
	    var listMucuas = new ListMucuas(),
		repository = this.__getRepository();
	    
	    BBXFunctions.setNavigationVars(repository, 'rede');
	    BBXFunctions.renderCommon('mocambola');
	    
	    listMucuas.render();
	}
    });
    
    return Router;
});
