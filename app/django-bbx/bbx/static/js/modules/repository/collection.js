define([
    'jquery',
    'underscore',
    'backbone',
    'modules/repository/model'
], function($, _, Backbone, RepositoryModel){
    var RepositoryModel = Backbone.Collection.extend({
	model: RepositoryModel
    });
    return RepositoryModel;
});