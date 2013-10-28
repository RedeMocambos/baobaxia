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
	    console.log('renderiza data');
	    var data = {
		medias: collection.models,
	     	_: _ 
	    };
	    
	    //console.log(collection);
	    
	    //htmlOutput = data.medias.toJSON();
	    //console.log(htmlOutput);
	    // adiciona template
	    var compiledTemplate = _.template(MediaResults, data);
//	    console.log(compiledTemplate);
	    this.$el.html(compiledTemplate);
	    $("#media-list").html(compiledTemplate);
	}
    });
    return MediaListView;
});