define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/bbx/base-functions',
    'modules/media/model',
    'modules/media/collection',
    'modules/mucua/model',
    'modules/repository/model',
    'text!templates/common/menu.html',
    'text!templates/common/busca.html',
    'text!templates/media/MediaResults.html',
    'text!templates/media/CaixaResultadoBusca.html'
], function($, _, Backbone, BBXBaseFunctions, MediaModel, MediaCollection, MucuaModel, RepositoryModel, Menu, Busca, MediaResults, CaixaResultadoBusca){
    var BuscaView = Backbone.View.extend({
	
	render: function(subroute){
	    /***
	     * Funções internas
	     */
	    _get_termos = function(returnArray) {
		returnArray = returnArray || false;
		search_url = $('#form_busca').attr('action');
		
		termos = new String(_.rest(search_url.split('search')));
		termos = termos.replace('//', '/');
		
		// return array
		if (returnArray) {
		    termos = termos.substring(1);
		    termos = termos.split('/');
		}
//		console.log('termos dentro: ' + termos[0]);
		return termos;
	    }
	    
	    _set_search_url = function(termos) {
		base_search_url = _get_base_search_url();
		termos = new String(termos);
		search_url = base_search_url + "/" + termos.replace(',', '/');
		
		$('#form_busca').attr('action', search_url);
	    }

	    _get_search_url = function() {
		return $('#form_busca').attr('action');
	    }
	    
	    _get_base_search_url = function() {
		search_url = $('#form_busca').attr('action');
		return _.first(search_url.split('search')) + "search";
	    }
	    
	    _do_search = function(termo, exclude) {
		termo = termo || '';
		exclude = exclude || '';
		base_search_url = _get_base_search_url();
		
		// caso especifique um input
		if (termo != '') { 
		    if (termo.type == 'keyup') {
			// adiciona termo à busca
			arr_termos = _get_termos(true);
			termo = termo.currentTarget.value;
			
			if (!_.contains(arr_termos, termo)) {
			    str_termos = _get_termos();
			    url_search = base_search_url + str_termos + "/" + termo;
			} else {
			    error = "Termo já existe";
			    console.log(error);
			    if (typeof $('mensage').html() === 'undefined') {
				$('#media-results-content .breadcrumb').append("<h4 class='message'>" + error + "</h4>");
			    } else {
				$('.message').html(error);
			    }
			    return false;
			}
		    }
		}
		
		if (typeof url_search === 'undefined') {
		    url_search = _get_search_url();
		}		
		_update_url(url_search);
	    }
	    
	    _update_url = function() {
		// tratamento da url
		url_search = url_search.replace('//', '/');
		url_search = url_search.replace(" ", "%20");
		url_search = url_search.replace("+", "/");
		document.location.href = url_search;
	    }

	    _add_term = function(obj) {
		console.log("_add_term()...");
		// abre caixa de busca de termo adicional (so uma vez, exibe)
		$(obj).after('<input type="text" class="caixa_busca">');
	    }
	    
	    _remove_term = function(e) {
		console.log("_remove_term()...");
		//console.log(e);
		// remove termo
		termoHtml = e.target.parentElement;
		linhaHtml = termoHtml.parentElement;
		termoExcluir = linhaHtml.firstChild.firstChild.innerHTML;
		termos = _get_termos(true);
		// remove item do array
		termos = _.without(termos, termoExcluir);
		_set_search_url(termos);
		
		// TODO: [bug]: remover as caixas de input também
		$(termoHtml).remove();
		
		// conta elementos para ver se tem que remover o que falta
		if (linhaHtml.childElementCount <= 2 ) {
		    $(linhaHtml).remove();
		}
		
		url_search = _get_search_url();
		_update_url(url_search);
	    }
	    
	    /***
	     * Tarefas
	     */
	    mensagemBusca = "Buscando '" + subroute + "' no repositorio '" + repository + "' e na mucua '" + mucua + "'";
	    console.log(mensagemBusca);
	    
	    // initial vars
	    config = $("body").data("data").config;
	    subroute = (subroute == null) ? '' : subroute;
	    frontend_url = '#' + repository + '/' + mucua + '/bbx/search/' + subroute;
	    $('#form_busca').attr('action', frontend_url);
	    
	    // acessa api
	    url = config.apiUrl + '/' + repository + '/' +  mucua + '/bbx/search/' + subroute;
	    var mediaCollection = new MediaCollection([], {url: url});
	    
	    // busca termos da url 
	    termos = [];
	    complete_link = '';
	    $.each(subroute.split("/"), function(key, term) {
		if (term != '') {
		    complete_link = (complete_link != '') ? complete_link + '/' : '';
		    complete_link += term;
		    termos.push({repository: repository,
				 mucua: mucua,
				 termo: term,
				 complete_link: complete_link
				});
		}
	    });
	    
	    /*** 
	     * Render do menu de termos
	     */
	    // nao necessariamente adiciona, pode trocar
	    if (typeof $('#resultado-busca').html() === 'undefined') {
		$('#menu').after(_.template(CaixaResultadoBusca, termos));
	    } else {
		$('#resultado-busca').html(_.template(CaixaResultadoBusca, termos));
	    }
	    
	    /***
	     * Fetch
	     */	    
	    mediaCollection.fetch({
		success: function() {
		    var data = {
			emptyMessage: 'Nenhum registro encontrado!',
			medias: mediaCollection.models,
			config: BBXBaseFunctions.getConfig(),
	     		_: _ 
		    };
		    
		    var compiledTemplate = _.template(MediaResults, data);
		    $('#content').html(compiledTemplate);
		}
	    });
	    
	    /***
	     * Eventos
	     */
	    $('#busca .button').click(function() { _do_search() });
	    $('.adicionar-termo').click(function() { _add_term(this) });
	    $('.remover-termo').click(function(e) { _remove_term(e) });
	    // TODO: [bug]: como fazer para pegar o evento somente da caixa atual, e nao de todas? 
	    $('.caixa_busca').keyup(function(e) { if (e.keyCode == 13) { _do_search(e); console.log($('.caixa_busca')) } });   // enter
	}
    });
    
    return BuscaView;
});