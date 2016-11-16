define([
    'jquery', 
    'lodash',
    'backbone',
    'modules/auth/functions',
], function($, _, Backbone, AuthFunctions){
    var LogoutView = Backbone.View.extend({

	// TODO: move from here to AuthFuntions and solve scope problem
	doLogout: function() {
	    console.log('logout');
	    // TODO: clean TOKEN info
	    AuthFunctions.doLogout();
	}
    });
    
    return LogoutView;
});
