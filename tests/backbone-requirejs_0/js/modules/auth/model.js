define([
    'jquery',
    'underscore',
    'backbone',
    'backbone_form',
    'text!templates/auth/LoginTemplate.html'
], function($, _, Backbone, BackboneForm, LoginTemplate) {
    var Login = Backbone.Model.extend({
	template: _.template(LoginTemplate, $('#form_login_template').html()),
	schema: {
	    login: 'Text',
	    repository: {type: 'Select', 
			 options: ['redemocambos', 'sarava']},
	    mucua: {type: 'Select', 
		    options: ['dandara', 'acotirene']},
            password:   'Password',
	}
    });
    
    return Login;	
});