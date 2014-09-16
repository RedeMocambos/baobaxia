define([
    'jquery', 
    'underscore',
    'backbone',
    'text!templates/common/Header.html',
    'text!templates/common/Menu.html',
], function($, _, Backbone, Header, MenuTpl){
    var HeaderView = Backbone.View.extend({
	render: function(data) {
	    var data = data || {},
	    config = $("body").data("bbx").config;
	    
	    data.currentUrl = Backbone.history.fragment;	    
	    data.homeUrl = config.interfaceUrl + config.MYREPOSITORY + "/" + config.MYMUCUA;
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