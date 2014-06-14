define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var RepositoryModel = Backbone.Model.extend({
	idAttribute: 'uuid'
    });
    
    return RepositoryModel;	
});