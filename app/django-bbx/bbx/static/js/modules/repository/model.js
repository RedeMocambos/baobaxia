define([
    'jquery',
    'backbone'
], function($, Backbone) {
    var RepositoryModel = Backbone.Model.extend({
	idAttribute: 'uuid'
    });
    
    return RepositoryModel;	
});
