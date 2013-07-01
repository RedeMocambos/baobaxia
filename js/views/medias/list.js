define([
    'jquery', 
    'underscore',
    'backbone', 
    'collections/medias',
    'text!templates/medias/list.html'  // plugin do require - raw text
], function($, _, Backbone, MediaCollection, MediaListView){
    var MediaView = Backbone.View.extend({
	el: $('#content'),
	render: function(){
	    
	    this.$el.html(MediaListTemplate);
	    
	    var media0 = new MediaModel({title: "História da comunidade do Freixas", author: "Comunidade do Freixas", origin: "Comunidade do Freixas", date: "28/06/2013", type: "video", licence: "Copyleft", tags: ["história", "memória", "público"]});
	    var media1 = new MediaModel({title: "Grito do beco", author: "Jamal Bauhd", origin: "Cidade de Água Preta", date: "28/06/2013", type: "video", licence: "Copyleft", tags: ["história", "memória", "público"]});
	    
	    var medias = [media0, media1];
	    var mediasCollection = new MediasCollection(medias);
	    var mediasView = new MediaListView({collection: mediascollection});
	    mediasView.render();
	}
    });
    return mediaListView;
});