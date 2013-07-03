define([
    'jquery', 
    'underscore',
    'backbone', 
    'models/MediaModel',
    'collections/media/MediaCollection',
    'text!templates/media/MediaListTemplate.html'
    
], function($, _, Backbone, MediaModel, MediaCollection, MediaListTemplate){
    
    var MediaListView = Backbone.View.extend({
	el: $("#media-list"),
	
	render: function(){
	    var data = {
		medias: this.collection.models,
		_: _ 
	    };
	    
	    var compiledTemplate = _.template( MediaListTemplate, data );
	    
	    $("#media-list").html( compiledTemplate ); 
	}
    });
    return MediaListView;
});