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
	
	render: function(data){
	    console.log('renderiza data');
	    var data = {
		medias : data,
	     	_: _ 
	    };
	    
	    console.log(data.medias);
	    //htmlOutput = data.medias.toJSON();
	    //console.log(htmlOutput);
	    // adiciona template	    
	    var compiledTemplate = _.template(MediaListTemplate, data.medias);
	    this.$el.html(compiledTemplate);
	    $("#media-list").html(compiledTemplate);
	}
    });
    return MediaListView;
});