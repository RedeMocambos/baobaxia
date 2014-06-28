define([
    'jquery', 
    'underscore',
    'backbone',
    'jquery_cookie',
    'modules/bbx/base-functions',
], function($, _, Backbone, jQueryCookie, jQueryJson, BBXBaseFunctions){
    var LogoutView = Backbone.View.extend({
	doLogout: function() {
	    
	    if ($.cookie('sessionBBX')) {
		$.removeCookie('sessionBBX');
	    }
	    $("body").data("bbx").userData = undefined;
	    $('#header').html('');
	    $('#content').html('');
	    $('#sidebar').detach();
	    $('#footer').html('');
	}
    });
    
    return LogoutView;
});