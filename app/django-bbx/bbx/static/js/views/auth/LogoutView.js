define([
    'jquery', 
    'lodash',
    'backbone',
    'modules/bbx/functions',
    'modules/auth/functions',
], function($, _, Backbone, jQueryJson, AuthFunctions){
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
