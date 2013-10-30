define([
    'jquery',
    'underscore',
    'backbone',
    'modules/media/model'
], function($, _, Backbone, MediaModel){
    var MediaCollection = Backbone.Collection.extend({
	model: MediaModel
    });
    return MediaCollection;
});