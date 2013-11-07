define([
    'jquery', 
    'underscore',
    'backbone', 
    'modules/media/model',
    'text!templates/media/MediaView.html'
], function($, _, Backbone, MediaModel, mediaView){
    
    var MediaView = Backbone.View.extend({
	// define elemento associado
	el: $('#content'),
	
	render: function(){
	    htmlOutput = this.model.toJSON();
	    // adiciona template
	    var compiledTemplate = _.template(mediaView, htmlOutput);
	    this.$el.html(compiledTemplate);
	}
    });
    return MediaView;
});