define([
    'jquery', 
    'underscore',
    'backbone',
    'text!templates/common/Buscador.html',
], function($, _, Backbone, BuscadorTpl){
    var BuscadorView = Backbone.View.extend({
	render: function(data) {
	    //var data = data || {};
	    console.log('buscador');
	    var config = $("body").data("bbx").config;
	    if ($('#buscador').html() == "" ||
		(typeof $('#buscador').html() === "undefined")) {
		$('#header').append(_.template(BuscadorTpl, data));
	    }
	}
    });
    return BuscadorView;
});