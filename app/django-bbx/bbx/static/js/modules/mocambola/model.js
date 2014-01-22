define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var MocambolaModel = Backbone.Model.extend({
	idAttribute: 'id'
    });
    
    return MocambolaModel;	
});