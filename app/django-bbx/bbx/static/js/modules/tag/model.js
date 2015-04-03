define([
    'jquery',
    'backbone'
], function($, Backbone) {
    var TagModel = Backbone.Model.extend({
	idAttribute: 'id'
    });
    
    return TagModel;	
});
