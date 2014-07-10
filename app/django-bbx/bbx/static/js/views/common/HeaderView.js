define([
    'jquery', 
    'underscore',
    'backbone',
    'text!templates/common/header.html',
    'text!templates/common/menu.html',
], function($, _, Backbone, Header, MenuTpl){
    var HeaderView = Backbone.View.extend({
	render: function(data) {
	    var data = data || {},
	    config = $("body").data("bbx").config;
	    
	    data.currentUrl = Backbone.history.fragment;	    
	    $('#header').html(_.template(Header, data));
	    
	    if ($('#menu').html() == "" ||
		(typeof $('#menu').html() === "undefined")) {
		data.config = config;
		
		$('#header').append(_.template(MenuTpl, data));
	    }
	}
    });
    return HeaderView;
});