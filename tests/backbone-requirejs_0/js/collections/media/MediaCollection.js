define([
    'jquery',
    'underscore',
    'backbone',
    'models/MediaModel'
], function($, _, Backbone, MediaModel){
    var MediaCollection = Backbone.Collection.extend({
	model: MediaModel,
	defaults: {
	    repository: '',
	    mucua: '',
	    args: ''
	},
	parse: function(data){
	    return data.objects;
	}
    });
    
    return MediaCollection;
});