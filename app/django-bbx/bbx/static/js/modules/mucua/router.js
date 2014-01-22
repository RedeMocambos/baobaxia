define([
    'jquery', 
    'backbone',
    'backbone_subroute',
//    'modules/mucua/model', 
], function($, Backbone, Backbone_Subroute){
    var Router = Backbone.SubRoute.extend({
	routes: {
	    // mucua
	    'get': 'getMucua',
	},

	getMucua: function() {
	    //console.log(this);
	    repository = this.getRepository();
	    mucua = this.getMucua();
	    console.log(repository);
	    console.log("get mucua " + repository + "/" + mucua);
	}

    });
    
    return Router;
});