define([
    'jquery', 
    'underscore',
    'backbone',
    'backbone_form',
    'modules/auth/model',
    'text!templates/common/header.html',
    'text!templates/common/footer.html',
    'text!templates/auth/LoginTemplate.html'
], function($, _, Backbone, BackboneForm, LoginModel, Header, Footer, LoginTemplate){
    var LoginView = Backbone.View.extend({
	// define elemento associado
	//el: $('#form_login_template'),
	el: $('#content'),
	
	render: function(){
  	    var form = new Backbone.Form({
		model: new LoginModel()
	    }).render();
	    
	    this.$el.append(form.el);
	    
	    //
	    data = {mucua_name: "dandara"}
	    var compiledHeader = _.template(Header, data);
	    
	    $('#header').append(compiledHeader);
	    $('#footer').append(Footer);	 
	}
    });
    return LoginView;
});