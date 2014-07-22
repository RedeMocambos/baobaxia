define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/bbx/base-functions',
    'modules/mocambola/model',
    'views/mocambola/HomeMocambola',
], function($, Backbone, BackboneSubroute, BBXBaseFunctions, MocambolaModel, HomeMocambola){
    var Router = Backbone.SubRoute.extend({
	routes: {
	    ':username' : 'homeMocambola',
	},

	initialize: function() {
	    console.log("module mocambola loaded");
	},
	
	homeMocambola: function(username) {	    
	    console.log("home mocambola");
	    BBXBaseFunctions.renderCommon('mocambola');
	    
	    var homeMocambola = new HomeMocambola(); 
	    homeMocambola.render(username);
	}
    });
    
    return Router;
});
