define([
    'jquery', 
    'lodash',
    'backbone',
    'text!/templates/' + userLang + '/common/Header.html',
    'text!/templates/' + userLang + '/common/Menu.html',
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
		
		$('#header-top').append(_.template(MenuTpl, data));
	    }
	}
    });
    return HeaderView;
});
