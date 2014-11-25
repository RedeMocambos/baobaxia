define([
    'jquery',
    'lodash',
    'backbone',
    'backbone_form',
    'text!/api/templates/' + userLang + '/auth/LoginTemplate.html'
], function($, _, Backbone, BackboneForm, LoginTemplate) {
    var Login = Backbone.Model.extend({
	template: _.template(LoginTemplate, $('#form_login_template').html()),
	schema: {
	    login: 'Text',
	    repository: {type: 'Select', 	
			 options: []},
	    mucua: {type: 'Select', 
		    options: []},
            password:   'Password',
	}
    });
    
    return Login;	
});
