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
//	    console.log(htmlOutput );
	    // adiciona template
	    var compiledTemplate = _.template(mediaView, htmlOutput);
	    this.$el.html(compiledTemplate);
	}
    });
    return MediaView;
});


// 	    var media0 = new MediaModel({title: "História da comunidade do Freixas", author: "Comunidade do Freixas", origin: "Comunidade do Freixas", date: "28/06/2013", type: "video", licence: "Copyleft", tags: ['história', 'memória', 'documentário', 'público']});
// //tags: ["história", "memória", "público"]});
// 	    var media1 = new MediaModel({title: "Grito do beco", author: "Jamal Bauhd", origin: "Cidade de Água Preta", date: "28/06/2013", type: "video", licence: "Copyleft", tags: ['cidade', 'ficção', 'público']});
	    
// 	    var mediaArray = [media0, media1];
// 	    var mediaCollection = new MediaCollection(mediaArray);
// 	    var mediaListView = new MediaListView({collection: mediaCollection});
