define([
    'jquery', 
    'underscore',
    'backbone',
    'backbone_form',
    'modules/auth/model',
    'modules/repository/model',
    'modules/repository/collection',
    'modules/mucua/model',
    'modules/mucua/collection',
    'text!templates/common/header.html',
    'text!templates/common/footer.html',
    'text!templates/auth/LoginTemplate.html'
], function($, _, Backbone, BackboneForm, LoginModel, RepositoryModel, RepositoryCollection, MucuaModel, MucuaCollection, Header, Footer, LoginTemplate){
    var LoginView = Backbone.View.extend({
	// define elemento associado
	//el: $('#form_login_template'),
	el: $('#content'),
	
	render: function(){
	    var form = new Backbone.Form({
		model: new LoginModel()
	    }).render();
	    this.$el.append(form.el);
	    
	    var defaultRepository = new RepositoryModel([], {url: '/api/repository/'});
	    var repositories = new RepositoryCollection([], {url: '/api/repository/list'});
	    var defaultMucua = new MucuaModel([], {url: '/api/mucua'});    
	    
	    defaultRepository.fetch({
		success: function() {
		    repository = defaultRepository.attributes[0];
		    // com info do repositorio, pode carregar as mucuas
		    var mucuas = new MucuaCollection([], {url: '/api/' + repository.name + '/mucuas'});
		    mucuas.fetch({
			success: function() {
			    for (var i = 0; i < mucuas.models.length; i++) {
				mucua = mucuas.models[i].attributes;
				$('#c2_mucua').append(new Option(mucua.note, mucua.note));
			    }
			}
		    });

		    // compila cabecalho
		    var compiledHeader = _.template(Header, repository);
		    $('#header').append(compiledHeader);
		}
	    });
	    
	    repositories.fetch({
		success: function() {
		    repoObj = {};
		    for (var i = 0; i < repositories.models.length; i++) {
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