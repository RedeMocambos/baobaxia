define([
    'jquery', 
    'underscore',
    'backbone',
    'text!templates/common/header.html',
    'text!templates/common/menu.html',
], function($, _, Backbone, Header, MenuTpl){
    var HeaderView = Backbone.View.extend({
	render: function(data) {
	    var config = $("body").data("bbx").config;
	    $('#header').html(_.template(Header, data));

	    if ($('#menu').html() == "" ||
		(typeof $('#menu').html() === "undefined")) {
		var data = {
		    repository: config.defaultRepository.name,
		    mucua: config.myMucua
		}
		$('#header').append(_.template(MenuTpl, data));
	    }
	}
    });
    return HeaderView;
});