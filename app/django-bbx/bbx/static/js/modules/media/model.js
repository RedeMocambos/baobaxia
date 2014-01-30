define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var MediaModel = Backbone.Model.extend({
	idAttribute: 'uuid'
    });
    
    return MediaModel;	
});