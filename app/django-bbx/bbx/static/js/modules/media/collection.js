define([
    'jquery',
    'backbone',
    'modules/media/model'
], function($, Backbone, MediaModel){
    var MediaCollection = Backbone.Collection.extend({
	model: MediaModel
    });
    return MediaCollection;
});
