define([
    'jquery', 
    'underscore',
    'backbone', 
    'models/MediaModel',
    'collections/media/MediaCollection',
    'text!templates/media/MediaListTemplate.html'
    
], function($, _, Backbone, MediaModel, MediaCollection, MediaListTemplate){
    
    var MediaListView = Backbone.View.extend({
	el: $("#content"),
	
	render: function(collection){
	    console.log('renderiza data');
	    var data = {
		medias: collection.models,
	     	_: _ 
	    };
	    
	    //console.log(collection);
	    
	    //htmlOutput = data.medias.toJSON();
	    //console.log(htmlOutput);
	    // adiciona template
	    var compiledTemplate = _.template(MediaListTemplate, data);
//	    console.log(compiledTemplate);
	    this.$el.html(compiledTemplate);
	    $("#media-list").html(compiledTemplate);
	}
    });
    return MediaListView;
});