define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var MediaModel = Backbone.Model.extend({
	// colocar url rest aqui
//	url: function() {
//	    return '/api/' + this.get('repository') + '/' +  this.get('mucua') + '/media/' + uuid;
//	},
	idAttribute: 'uuid'
    });
    
    return MediaModel;	
});