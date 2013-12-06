define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/media/model',
    'modules/media/collection',
    'modules/mucua/model',
    'modules/repository/model',
    'text!templates/common/header.html',
    'text!templates/common/footer.html',
    'text!templates/media/MediaResults.html'
], function($, _, Backbone, MediaModel, MediaCollection, MucuaModel, RepositoryModel, Header, Footer, MediaResults){
    var BuscaView = Backbone.View.extend({
	// define elemento associado
	//el: $('#form_login_template'),
	el: $('#content'),
	
	render: function(subroute){
	    mensagemBusca = "Buscando '" + subroute + "' no repositorio '" + repository + "' e na mucua '" + mucua + "'";
	    console.log(mensagemBusca);
	    
	    url = '/api/' + repository + '/' +  mucua + '/bbx/search/' + subroute;
	    
	    var mediaCollection = new MediaCollection([], {url: url});
	    
	    // compila cabecalho
	    if ($('#header').html() == '') {
		var compiledHeader = _.template(Header, repository);
		$('#header').append(compiledHeader);
	    }
	    
	    mediaCollection.fetch({
		success: function() {
		    var data = {
			medias: mediaCollection.models,
			config: {'imagePath': ''}, // TODO: centralizar as configuracoes em um arquivo mais central
	     		_: _ 
		    };
		    
		    var compiledTemplate = _.template(MediaResults, data);
		    $('#content').html(compiledTemplate);
		    $("#media-list").html(compiledTemplate);
		}
	    });
	    
	    // compila footer
	    if ($('#footer').html() == '') {
		$('#footer').append(Footer);
	    }
	}
    });
    
    return BuscaView;
});