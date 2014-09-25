define([
    'jquery', 
    'underscore',
    'backbone',
    'textext',
    'text!templates/common/Buscador.html',
    'textext_ajax',
    'textext_arrow',
    'textext_autocomplete',
    'textext_clear',
    'textext_filter',
    'textext_focus',
    'textext_filter',
    'textext_prompt',
    'textext_tags',
], function($, _, Backbone, Textext, BuscadorTpl){
    var BuscadorView = Backbone.View.extend({
	render: function(data) {
	    //var data = data || {};
	    console.log('buscador');
	    var config = $("body").data("bbx").config;
	    if ($('#buscador').html() == "" ||
		(typeof $('#buscador').html() === "undefined")) {
		$('#header-bottom').append(_.template(BuscadorTpl, data));
		$('head').append('<link rel="stylesheet" href="/css/textext.plugin.tags.css" type="text/css" />');
	    }
	}
    });
    return BuscadorView;
});
