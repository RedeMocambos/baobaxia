/**
 * Baobaxia
 * 2014
 * 
 * media/media-functions.js
 *
 *  Media related functions
 *
 */

define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/bbx/base-functions',
    'modules/media/model',
    'modules/media/collection',
    'modules/mucua/model',
    'text!templates/media/MediaDestaquesMucua.html',
    'text!templates/media/MediaNovidades.html',
    'text!templates/media/MediaMocambola.html',
    'text!templates/media/MediaRelated.html',
    'text!templates/media/MediaResults.html',
    'text!templates/media/MediaGrid.html',
    'text!templates/media/MediaList.html',
    'text!templates/common/ResultsMessage.html',
    'text!templates/common/SearchTagsMenu.html'
], function($, _, Backbone, BBXBaseFunctions, MediaModel, MediaCollection, MucuaModel, MediaDestaquesMucuaTpl, MediaNovidadesTpl, MediaMocambolaTpl, MediaRelatedTpl, MediaResultsTpl, MediaGridTpl, MediaListTpl, ResultsMessageTpl, SearchTagsMenuTpl){
    var init = function() {
	this.functions = {};
	this.functions.BBXBaseFunctions = BBXBaseFunctions;
	console.log(this);
    }

    var __getConfig = function() {
	return $("body").data("bbx").config;
    }
    
    var __parseResultsMessage = function(message, target = '') {
	var target = target || '#result-string',
	imageTag = '',
	data = {
	    config: __getConfig(),
	    message: message
	}
	
	$(target).html(_.template(ResultsMessageTpl, data));	
    };    

    var __parseMenuSearch = function(terms) {
	var config = __getConfig(),
	data = {};
	if (terms != '') {
	    data.terms = terms;
	    $("body").data("bbx").terms = terms;
	    data.baseUrl = '#' + config.repository + '/' + config.mucua + '/bbx/search/';
	    $('#result-string').html(_.template(SearchTagsMenuTpl, data));
	    
	    // add events
	    $('.trash-term').on('click', function(event){ deleteTagMenuSearch(event)});	    
	    $('.add-term').on('click', function(event){ addTagMenuSearch(event)});
	} else {
	    $('#result-string').html('');
	}
    }

    var deleteTagMenuSearch = function(event) {
	var target = event.target,
	tagRemove = $(target).parents()[0],
	tagRemoveName = $(tagRemove.children[0]).html(),
	terms = _.without($('body').data('bbx').terms, tagRemoveName),
	currentUrl = Backbone.history.location.hash,
	baseUrl = currentUrl.split('search/')[0],
	termsUrl = currentUrl.split('search/')[1],
	newUrl = baseUrl + 'search/';
	
	// compose new Url
	_.each(termsUrl.split(tagRemoveName), function(term) {
	    if (term != '') {
		// limpa '/' do inicio e do fim
		term = (term.charAt(0) == '/') ? term.substring(1) : term;
		term = (term.charAt(term.length -1) == '/') ? term.substring(0, term.length-1) : term;
		newUrl += '/' + term;
	    }
	});
	newUrl = newUrl.replace(/\/\//, '\/');
	
	__parseMenuSearch(terms);
	window.location = newUrl;
    }
    
    var addTagMenuSearch = function(event) {
	console.log('addTag');
	// TODO: on/off para essa funcao ou algo similar
	$('#caixa_busca').off();
	$('#caixa_busca').keyup(function(e) {
	    if (e.keyCode == 13) {
		var cummulative = true;
		doSearch(cummulative);
	    } 
	});
	$('.plus-search').css({"border": "2px solid #339033", "padding-bottom": "2px"});
	$('#caixa_busca').focus();
	// manda foco para campo de busca
    }

    var showByList = function(target = '') {
	var target = target || '#media-results .media',
	data = $('body').data('bbx').data;
	
	// TODO: adicionar ao cookie como prefencia
	$(target).html(_.template(MediaListTpl, data));
	$(target).remove('media-grid').addClass('media-list');
	$('.media-display-type .grid').css("background", "url(/images/grid-off.png)");
	$('.media-display-type .list').css("background", "url(/images/list-on.png)");
    }

    var showByGrid = function(target = '') {
	var target = target || '#media-results .media',
	data = $('body').data('bbx').data;
	
	// TODO: adicionar ao cookie como prefencia
	$(target).html(_.template(MediaGridTpl, data));
	$(target).remove('media-list').addClass('media-grid');
	$('.media-display-type .grid').css("background", "url(/images/grid-on.png)");
	$('.media-display-type .list').css("background", "url(/images/list-off.png)");
    }
    
    var getMediaTypes = function() {
	return {
	    '': '',
	    'audio': 'audio',
	    'imagem': 'imagem',
	    'video': 'video',
	    'arquivo': 'arquivo'
	}
    };

    var getTypeByMime = function(mime) {	
	var valid_mimetypes = {
	    'audio/ogg': 'audio',
	    'audio/mpeg': 'audio',
	    'image/jpeg': 'imagem',
	    'video/ogg': 'video',
	    'video/ogv': 'video',
	    'video/avi': 'video',
	    'video/mp4': 'video',
	    'application/pdf': 'arquivo'
	},
	type = 'arquivo';
	
	if (valid_mimetypes.hasOwnProperty(mime)) {
	    type = valid_mimetypes[mime];
	}
	
	return type;
    };
    
    var getMediaLicenses = function() {
	return {
	    '': '',
	    'gplv3': 'gpl v3 - gnu general public license',
	    'gfdl': 'gfdl - gnu free documentation license',
	    'lgplv3': 'lgpl v3 - gnu lesser public license',
	    'agplv3': 'agpl v3 - gnu affero public license',
	    'copyleft':  'copyleft',
	    'cc': 'creative commons',
	    'cc_nc': 'creative commons - não comercial',
	    'cc_ci': 'creative commons -  compartilha igual',
	    'cc_ci_nc': 'creative commons - compartilha igual - não comercial',
	    'cc_sd': 'creative commons - sem derivação',
	    'cc_sd_nc': 'creative commons - sem derivação - não comercial'
	}
    };

    var getMedia = function(url, callback) {
	var media = new MediaModel([], {url: url});
	media.fetch({
	    success: function() {
		var mediaData = {
		    medias: media.attributes,
		    formatDate: function(date) {
			var newDate = '',
			re = /^(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)[\.0-9]*Z$/,
			matches = date.match(re);
			return matches[3] + '/' + matches[2] + '/' + matches[1];	
		    }
		};
		// callback / altera
		if (typeof callback == 'function') {
		    // execute callback
		    callback(mediaData);
		}
	    }
	});
    }		   
    
    var getMediaByMucua = function(el) {
	var config = __getConfig(),
	url = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/bbx/search';
	
	getMedia(url, function(data){
	    $(el).append(_.template(MediaDestaquesMucuaTpl));
	    data.message = 'Nenhuma media na mucua ' + config.mucua + ' encontrada.';
	    
	    $('body').data('bbx').data = data;
	    showByGrid('#destaques-mucua .media');
	});
    };

    var getMediaByNovidades = function(el) {
	var config = __getConfig(),
	url = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/bbx/search' ;	
	
	getMedia(url, function(data){
	    $(el).append(_.template(MediaNovidadesTpl));
	    data.message = 'Nenhuma novidade em ' + config.mucua + '.';

	    // TODO: quando tem mais de um bloco de dados (ex: ultimas novidades E conteudo destacado), pensar em como guardar duas ou mais listas de media
	    $('body').data('bbx').data = data;
	    showByGrid('#media-novidades .media');
	    $('.media-display-type .grid').on('click', function(){ showByGrid()});	    
	    $('.media-display-type .list').on('click', function(){ showByList()});	    
	});
    };

    var getMediaRelated = function(uuid) {
	var config = __getConfig(),
	url = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/media/' + uuid + '/related';
	
	getMedia(url, function(data){
	    $('#content').append(_.template(MediaRelatedTpl));
	    data.message = 'Nenhuma media relacionada encontrada.';

	    $('body').data('bbx').data = data;
	    showByGrid('#media-related .media');
	    $('.media-display-type .grid').on('click', function(){ showByGrid()});	    
	    $('.media-display-type .list').on('click', function(){ showByList()});	    
	});
    };

    var getMediaByMocambola = function(origin, username) {
	var config = __getConfig(),
	url = '';
	
	if (origin == 'all') {
	    url = config.apiUrl + '/' + config.repository + '/all/mocambola/' + username + '/media';
	} else {
	    url = config.apiUrl + '/' + config.repository + config.origin + '/mocambola/' + username + '/media';
	}
	
	getMedia(url, function(data){
	    $('#content').append(_.template(MediaMocambolaTpl));
	    data.message = 'Mocambola ainda nao publicou nenhum conteudo.';

	    $('body').data('bbx').data = data;
	    showByGrid('#media-mocambola .media');
	    $('.media-display-type .grid').on('click', function(){ showByGrid()});	    
	    $('.media-display-type .list').on('click', function(){ showByList()});	    
	});
    };
    
    var getMediaSearch = function(url) {
	getMedia(url, function(data) {
	    var resultCount,
	    messageString = "",
	    terms = {},
	    reString = /search\/(.*)$/,
	    config = $("body").data("bbx").config;
	    terms = url.match(reString)[1].split('/');
	    
	    // parse result message
	    if (!_.isEmpty(data.medias)) {
		resultCount = _.size(data.medias);
		messageString = (resultCount == 1) ? resultCount + ' resultado' : resultCount + ' resultados';
	    } else {
		messageString = "Nenhum resultado";
	    }	    
	    __parseMenuSearch(terms);
	    $('#imagem-busca').attr('src', config.imagePath + '/buscar.png');
	    $('#content').html(_.template(MediaResultsTpl));
	    data.message = 'Nenhuma media encontrada para essa busca';

	    $('body').data('bbx').data = data;
	    showByGrid('#media-results .media');
	    $('.media-display-type .grid').on('click', function(){ showByGrid()});	    
	    $('.media-display-type .list').on('click', function(){ showByList()});	    
	});	
    };
    
    /**
     * execute search
     * 
     */
    var doSearch = function(cummulative = false) {
	console.log('doSearch(' + cummulative + ')');
	var term = $('#caixa_busca')[0].value,
	cummulative = cummulative || false,
	config = __getConfig(),
	url = '',
	apiUrl = '';
	
	// if asked to do cummulative search, get terms
	if (cummulative) {
	    var terms = $('body').data('bbx').terms || {};
	    if (_.isObject(terms) && _.size(terms) > 0) {
		terms.push(term);
		terms = terms.join('/');
	    } else {
		terms = term;
	    }
	} else {
	    terms = term;
	}
	
	url = '#' + config.repository      + '/' + config.mucua + '/bbx/search/' + terms;
	apiUrl = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/bbx/search/' + terms;    
	//TODO: dando alguma zica na busca, apagando um termo =/
	window.location.href = url;
	$('#imagem-busca').attr('src', config.imagePath + '/buscando.gif');
	getMediaSearch(apiUrl);
    };
    
	    
    return {
	init: init,
	__getConfig: __getConfig,
	addTagMenuSearch: addTagMenuSearch,
	deleteTagMenuSearch: deleteTagMenuSearch,
	showByGrid: showByGrid,
	showByList: showByList,
	doSearch: doSearch,
	getMedia: getMedia,
	getMediaByMucua: getMediaByMucua,
	getMediaByNovidades: getMediaByNovidades,
	getMediaByMocambola: getMediaByMocambola,
	getMediaSearch: getMediaSearch,
	getMediaRelated: getMediaRelated,
	getMediaTypes: getMediaTypes,
	getMediaLicenses: getMediaLicenses,
	getTypeByMime: getTypeByMime
    }
});