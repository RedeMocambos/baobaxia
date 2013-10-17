define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var MediaModel = Backbone.Model.extend({
	// colocar url rest aqui
	id: 'pk'
    });
    
    return MediaModel;	
});