define([
    'jquery',
    'underscore',
    'backbone',
    'models/MediaModel'
], function($, _, Backbone, MediaModel){
    var MediaCollection = Backbone.Collection.extend({
	model: MediaModel
    });
    return MediaCollection;
});