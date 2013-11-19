define([
    'jquery', 
    'underscore',
    'backbone',
    'backbone_form',
    'modules/auth/model',
    'modules/repository/model',
    'modules/repository/collection',
    'text!templates/common/header.html',
    'text!templates/common/footer.html',
    'text!templates/auth/LoginTemplate.html'
], function($, _, Backbone, BackboneForm, LoginModel, RepositoryModel, RepositoryCollection, Header, Footer, LoginTemplate){
    var LoginView = Backbone.View.extend({
	// define elemento associado
	//el: $('#form_login_template'),
	el: $('#content'),
	
	render: function(){
	    var form = new Backbone.Form({
		model: new LoginModel()
	    }).render();
	    this.$el.append(form.el);
	    
	    var defaultCollection = new RepositoryModel([], {url: '/api/repository'});
	    var repositories = new RepositoryCollection([], {url: '/api/repository/list'});
	    
	    defaultCollection.fetch({
		success: function() {
		    var compiledHeader = _.template(Header, defaultCollection.attributes[0]);
		    $('#header').append(compiledHeader);
		}
	    });
	    
	    repositories.fetch({
		success: function() {
		    list = repositories.models.length;
		    repoObj = {};
		    for (var i = 0; i < list; i++) {
			repo = repositories.models[i].attributes;
			$('#c2_repository').append(new Option(repo.name, repo.name));
		    }
		}
	    });
	    
	    $('#footer').append(Footer);	 
	}
    });
    return LoginView;
});