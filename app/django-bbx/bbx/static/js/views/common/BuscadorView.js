define([
    'jquery', 
    'lodash',
    'backbone',
    'textext',
    'modules/media/functions',
    'text!/templates/' + BBX.userLang + '/common/Buscador.html',
    'textext_ajax',
    'textext_tags',
], function($, _, Backbone, Textext, MediaFunctions, BuscadorTpl){
    var BuscadorView = Backbone.View.extend({
	render: function(data) {
	    console.log('buscador');
	    var config = $("body").data("bbx").config,
		tags = BBX.config.subroute.split('bbx/search/');

	    // add tag classes for functional tags style
	    tags = MediaFunctions.__cleanTerms(tags)
	    
	    _.each(tags, function(tag) {
		$("body").addClass(tag);	  
	    });
	    
	    if ($('#buscador').html() == "" ||
		(typeof $('#buscador').html() === "undefined")) {
		$('#header-bottom').prepend(_.template(BuscadorTpl, data));
		$('head').append('<link rel="stylesheet" href="/css/textext.plugin.tags.css" type="text/css" />');
	    }
	}
    });
    return BuscadorView;
});
