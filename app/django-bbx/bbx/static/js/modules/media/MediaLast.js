define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/bbx/base-functions',
    'modules/media/model',
    'modules/media/collection',
    'modules/repository/model',
    'text!templates/common/menu.html',
    'text!templates/common/busca.html',
], function($, _, Backbone, BBXBaseFunctions, MediaModel, MediaCollection, Menu, Busca){
    var BuscaView = Backbone.View.extend({
	
	render: function(subroute){
	    console.log('view last content');
	}
    })
});