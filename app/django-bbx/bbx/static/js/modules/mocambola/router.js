define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/mocambola/model',
    'views/mocambola/HomeMocambola',
], function($, Backbone, BackboneSubroute, MocambolaModel, HomeMocambola){
    var Router = Backbone.SubRoute.extend({
	routes: {
	    ':username/limit/:limit' : 'homeMocambola',
	    ':username' : 'homeMocambola',
	},

	initialize: function() {
	    console.log("module mocambola loaded");
	},

	__getRepository: function() {
	    return this.prefix.split('/')[0];
	},
	__getMucua: function() {
	    return this.prefix.split('/')[1];
	},
	
	homeMocambola: function(username, limit) {	    
	    var limit = limit || '',
		homeMocambola = new HomeMocambola(),
		repository = this.__getRepository(),
		mucua = this.__getMucua();
	    
	    console.log("home mocambola");
	    
	    BBXFunctions.setNavigationVars(repository, mucua);
	    BBXFunctions.renderCommon('mocambola');
	    
	    homeMocambola.render(username, limit);
	}
    });
    
    return Router;
});
