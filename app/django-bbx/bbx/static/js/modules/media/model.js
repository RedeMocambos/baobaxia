define([
    'jquery',
    'backbone'
], function($, Backbone) {
    var MediaModel = Backbone.Model.extend({
	idAttribute: 'uuid'
    });
    
    return MediaModel;	
});
