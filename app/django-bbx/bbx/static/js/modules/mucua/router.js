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

	__getRepository: function() {
	    return this.prefix.split('/')[0];
	},
	__getMucua: function() {
	    return this.prefix.split('/')[1];
	},
	
	homeMucua: function() {	    
	    console.log("home mucua");

	    var repository = this.__getRepository(),
	    mucua = this.__getMucua();
	    // TODO: verificar se mantem isso ou se cria view especifica para Network
	    if (mucua == 'rede') {
		BBXBaseFunctions.renderCommon('rede');
	    } else {
		BBXBaseFunctions.renderCommon('mucua');
	    }
	    BBXBaseFunctions.setNavigationVars(repository, mucua);
	    var homeMucua = new HomeMucua(); 
	    homeMucua.render();
	},

	infoMucua: function() {
	    console.log("info mucua");
	}
    });
    
    return Router;
});
