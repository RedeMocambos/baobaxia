define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/bbx/functions',
    'modules/mocambola/model',
    'views/mocambola/HomeMocambola',
], function($, Backbone, BackboneSubroute, BBXFunctions, MocambolaModel, HomeMocambola){
    var Router = Backbone.SubRoute.extend({
	routes: {
	    ':username' : 'homeMocambola',
	},

	initialize: function() {
	    console.log("module mocambola loaded");
	},
	
	homeMocambola: function(username) {	    
	    console.log("home mocambola");
	    BBXFunctions.renderCommon('mocambola');
	    
	    var homeMocambola = new HomeMocambola(); 
	    homeMocambola.render(username);
	}
    });
    
    return Router;
});
