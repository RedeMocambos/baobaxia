define([
    'jquery', 
    'underscore',
    'backbone', 
    'modules/media/model',
    'modules/media/collection',
    'text!templates/media/MediaResults.html'    
], function($, _, Backbone, MediaModel, MediaCollection, MediaResults){
    
    var MediaListView = Backbone.View.extend({
	el: $("#content"),
	
	render: function(collection){
	    var data = {
		medias: collection.models,
	     	_: _ 
	    };
	    
	    var compiledTemplate = _.template(MediaResults, data);
	    this.$el.html(compiledTemplate);
	    $("#media-list").html(compiledTemplate);
	}
    });
    return MediaListView;
});