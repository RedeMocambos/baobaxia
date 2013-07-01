define([
    'underscore', 
    'backbone'
], function(_, Backbone){
    var MediaModel = Backbone.Model.extend({
	defaults: {
	    title: "Arquivo de mídia X",
	    author: "Autoria",
	    origin: "Quilombo Gunga",
/*	    date: Date.today(),*/
	    licence: "Copyleft",
	    tags: [],
	}
    });
    return MediaModel;	
});