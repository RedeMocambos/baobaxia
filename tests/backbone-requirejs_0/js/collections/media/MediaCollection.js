define([
    'jquery',
    'underscore',
    'backbone',
    'models/MediaModel'
], function($, _, Backbone, MediaModel){
    var MediaCollection = Backbone.Collection.extend({
	model: MediaModel,
	
	initialize: function(){
	    console.log('media collection');

	    var media0 = new MediaModel({title: "História da comunidade do Freixas", author: "Comunidade do Freixas", origin: "Comunidade do Freixas", date: "28/06/2013", type: "video", licence: "Copyleft"});
//tags: ["história", "memória", "público"]});
	    var media1 = new MediaModel({title: "Grito do beco", author: "Jamal Bauhd", origin: "Cidade de Água Preta", date: "28/06/2013", type: "video", licence: "Copyleft"});
	}
    });
    
    return MediaCollection;
});