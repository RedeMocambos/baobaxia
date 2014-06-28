define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/bbx/base-functions',
    'modules/mucua/model',
    'views/mucua/HomeMucua',
], function($, Backbone, BackboneSubroute, BBXBaseFunctions, MucuaModel, HomeMucua){
    var Router = Backbone.SubRoute.extend({
	routes: {
	    '*' : 'homeMucua',
	    'info' : 'infoMucua',
	},

	initialize: function() {
	    console.log("module mucua loaded");
	},
	
	homeMucua: function() {	    
	    console.log("home mucua");
	    
	    var data = {};
	    var homeMucua = new HomeMucua(); 
	    homeMucua.render();
	},

	infoMucua: function() {
	    console.log("info mucua");
	}
    });
    
    return Router;
});
