define([
    'jquery', 
    'backbone',
    'backbone_subroute',
    'modules/bbx/base-functions',
    'modules/mocambola/model', 
    'modules/mocambola/MocambolaView',
], function($, Backbone, Backbone_Subroute, BBXBaseFunctions, MocambolaModel, MocambolaView){
    var Router = Backbone.SubRoute.extend({
	routes: {
	    // mucua
	    'list': 'list',
	    ':mocambola': 'view',
	},

	_getRepository: function() {
	    return this.prefix.split('/')[0];
	},

	_getMucua: function() {
	    return this.prefix.split('/')[1];
	},

	list: function() {
	},
	
	view: function(mocambola) {
	    console.log('get dados do mocambola ' + mocambola);

	    repository = this._getRepository();
	    mucua = this._getMucua();
	    BBXBaseFunctions.renderCommon(repository, mucua);
	    
	    var mocambolaView = new MocambolaView();
	    mocambolaView.render(mocambola);
	}
    });
    
    return Router;
});