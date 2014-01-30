define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var RepositoryModel = Backbone.Model.extend({
	idAttribute: 'name',
	defaults: {
	    name:       '',
	    note:       '',
	    enableSync: true
	},
    });
    
    return RepositoryModel;	
});