define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/media/model',
    'modules/media/collection',
    'modules/mucua/model',
    'modules/repository/model',
    'text!templates/common/menu.html',
    'text!templates/common/busca.html',
    'text!templates/media/MediaResults.html',
    'text!templates/media/CaixaResultadoBusca.html'
], function($, _, Backbone, MediaModel, MediaCollection, MucuaModel, RepositoryModel, Menu, Busca, MediaResults, CaixaResultadoBusca){
    var BuscaView = Backbone.View.extend({
	
	render: function(subroute){
	    mensagemBusca = "Buscando '" + subroute + "' no repositorio '" + repository + "' e na mucua '" + mucua + "'";
	    console.log(mensagemBusca);
	    
	    subroute = (subroute == null) ? '' : subroute;
	    url = '/api/' + repository + '/' +  mucua + '/bbx/search/' + subroute;
	    frontend_url = '#' + repository + '/' + mucua + '/bbx/search/' + subroute;
	    var mediaCollection = new MediaCollection([], {url: url});
	    $('#form_busca').attr('action', frontend_url);
	    
	    get_termos = function(returnArray = false) {
		search_url = $('#form_busca').attr('action');
		termos = new String(_.rest(search_url.split('search')));
		termos = termos.replace('//', '/');
		
		// return array
		if (returnArray) {
		    termos = termos[0].substring(1);
		    termos = termos.split('/');
		}
		
		return termos;
	    }
	    
	    get_base_search_url = function() {
		search_url = $('#form_busca').attr('action');
		return _.first(search_url.split('search')) + "search";
	    }
	    
	    //TODO: talvez seja legal buscar uma forma backbone de implementar os eventos
	    do_search = function(termo = '', exclude = '') {
		// caso venha de um input diferente,
		base_search_url = get_base_search_url();
		termos = get_termos();
		
		if (termo != '') { 
		    // adiciona
		    // concat - busca 
		    termo = termo.currentTarget.value;		    
		    url_search = base_search_url + termos + "/" + termo;
		}
		
		console.log('exclude: ' + exclude);
		if (exclude != '') {
		    // remove
		    termos = new String(get_termos());
		    termos = termos.replace(exclude, '');
		    termos = termos.replace('//', '/');
		    
		    url_search = base_search_url + termos;
		}
		
		console.log("search_url: " + base_search_url + " / termos " + termos);

		url_search = url_search.replace(" ", "%20");
		url_search = url_search.replace("+", "/");
		
		console.log('url_search: ' + url_search);
		
		$('#form_busca').attr('action', url_search);
		document.location.href = url_search;
	    }
	    
	    add_term = function() {
		// abre caixa de busca de termo adicional (so uma vez, exibe)
		console.log("adiciona box ");
		$('#resultado-busca .caixa_busca').toggle();
	    }

	    remove_term = function(e) {
		console.log(e);
		// remove termo
		termoHtml = e.target.parentElement;
		linhaHtml = termoHtml.parentElement;
		nomeTermo = linhaHtml.firstChild.firstChild.innerHTML;
		
		$(termoHtml).remove();
		
		// conta elementos para ver se tem que remover o que falta		
		if (linhaHtml.childElementCount <= 2 ) {
		    $(linhaHtml).remove();
		}
		do_search('', nomeTermo);
	    }
	    
	    termos = [];
	    $.each(subroute.split("/"), function(key, term) {
		if (term != '') {
		    termos.push({repository: repository,
				 mucua: mucua,
				 termo: term,
				 complete_link: subroute
				});
		}
	    });
	    
	    console.log('termos: ' + termos);
	    
	    // nao necessariamente adiciona, pode trocar
	    $('#menu').after(_.template(CaixaResultadoBusca, termos));
	    
	    $('#busca .button').click(function() { do_search() });
	    $('.adicionar-termo').click(function() { add_term() });
	    $('.remover-termo').click(function(e) { remove_term(e) });
	    $('.caixa_busca').keyup(function(e) { if (e.keyCode == 13) do_search(e); });   // enter
	    
	    // breadcrumb
	    //$(".breadcrumb").html("");
	    
	    mediaCollection.fetch({
		success: function() {
		    var data = {
			emptyMessage: 'Nenhum registro encontrado!',
			medias: mediaCollection.models,
			config: {'imagePath': ''}, // TODO: centralizar as configuracoes em um arquivo mais central
	     		_: _ 
		    };
		    
		    var compiledTemplate = _.template(MediaResults, data);
		    $('#content').html(compiledTemplate);
		}
	    });
	}
    });
    
    return BuscaView;
});