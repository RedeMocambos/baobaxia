define([
    'jquery', 
    'lodash',
    'backbone',
     'modules/media/functions',
    'text!/templates/' + BBX.userLang + '/common/Buscador.html',
    'textext_tags',
], function($, _, Backbone, MediaFunctions, BuscadorTpl, TextextTags){
    var BuscadorView = Backbone.View.extend({
	render: function(data) {
	    console.log('buscador');
	    var config = BBX.config,
		tags = MediaFunctions.__getTagsFromUrl();

	    _.each(tags, function(tag) {
		$("body").addClass(tag);	  
	    });
	    
	    if ($('#buscador').html() == "" ||
		(typeof $('#buscador').html() === "undefined")) {
		
		$('#header-bottom').prepend(_.template(BuscadorTpl));
		$('head').append('<link rel="stylesheet" href="/css/textext.core.css" type="text/css" />');		    
		$('head').append('<link rel="stylesheet" href="/css/textext.plugin.tags.css" type="text/css" />');
		$('head').append('<link rel="stylesheet" href="/css/textext.plugin.autocomplete.css" type="text/css" />');		    

	    }
	}
    });
    return BuscadorView;
});
