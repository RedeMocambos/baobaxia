define([
    'jquery',
    'underscore',
    'backbone',
    'models/MediaModel'
], function($, _, Backbone, MediaModel){
    var MediaCollection = Backbone.Collection.extend({
	model: MediaModel,
	url: '/api/medias',
	parse: function(data){
	    return data.objects;
	}
    });
    
    return MediaCollection;
});