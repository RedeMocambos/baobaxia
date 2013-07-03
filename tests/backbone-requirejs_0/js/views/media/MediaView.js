define([
    'jquery', 
    'underscore',
    'backbone', 
    'models/MediaModel',
    'collections/media/MediaCollection',
    'views/media/MediaListView',
    'text!templates/media/MediaTemplate.html'
], function($, _, Backbone, MediaModel, MediaCollection, MediaListView, MediaTemplate){*/
    
    var MediaView = Backbone.View.extend({
	// define elemento associado
	el: $('#content'),
	
	render: function(){
	    
	    // adiciona template
	    this.$el.html(MediaTemplate);
	    
	    var media0 = new MediaModel({title: "História da comunidade do Freixas", author: "Comunidade do Freixas", origin: "Comunidade do Freixas", date: "28/06/2013", type: "video", licence: "Copyleft"});
//tags: ["história", "memória", "público"]});
	    var media1 = new MediaModel({title: "Grito do beco", author: "Jamal Bauhd", origin: "Cidade de Água Preta", date: "28/06/2013", type: "video", licence: "Copyleft"});
	    console.log('mediaList');
	    var mediaArray = [media0, media1];
	    var mediaCollection = new MediaCollection(mediaArray);
	    var mediaListView = new MediaListView({collection: MediaCollection});
	    mediaListView.render();
	    
	}
    });
    return MediaView;
});