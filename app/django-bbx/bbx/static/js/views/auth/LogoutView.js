define([
    'jquery', 
    'lodash',
    'backbone',
    'jquery_cookie',
    'modules/bbx/functions',
], function($, _, Backbone, jQueryCookie, jQueryJson){
    var LogoutView = Backbone.View.extend({

	// TODO: move from here to AuthFuntions and solve scope problem
	doLogout: function() {
	    console.log('logout');
	    if ($.cookie('sessionBBX')) {
		// TODO: assure that the cookie will be removed at all!
		// this is raising a bug: 
		// when create user, logout, and then create or login as other user, don't get visually logged 
		// (but the cookie is the),  user must refresh page
		$.removeCookie('sessionBBX');
	    }
	    BBX.config.userData = undefined;
	    $('#header').html('');
	    $('#content').html('');
	    $('#sidebar').detach();
	    $('#footer').html('');
	}
    });
    
    return LogoutView;
});
