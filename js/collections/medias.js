define([
    'underscore',
    'backbone',
    // Pull in the Model module from above
    'models/media'
], function(_, Backbone, MediaModel){
    var MediaCollection = Backbone.Collection.extend({
	model: MediaModel
    });
    // You don't usually return a collection instantiated
    return MediaCollection;
});