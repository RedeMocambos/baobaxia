define([
    'jquery', 
    'lodash',
    'backbone',
    'textext',
    'text!templates/common/Buscador.html',
    'textext_ajax',
    'textext_tags',
], function($, _, Backbone, Textext, BuscadorTpl){
    var BuscadorView = Backbone.View.extend({
	render: function(data) {
	    //var data = data || {};
	    console.log('buscador');
	    var config = $("body").data("bbx").config;
	    if ($('#buscador').html() == "" ||
		(typeof $('#buscador').html() === "undefined")) {
		$('#header-bottom').prepend(_.template(BuscadorTpl, data));
		$('head').append('<link rel="stylesheet" href="/css/textext.plugin.tags.css" type="text/css" />');
	    }
	}
    });
    return BuscadorView;
});
