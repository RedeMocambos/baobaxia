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
    'text!templates/common/ResultsMessage.html',
    'text!templates/common/SearchTagsMenu.html'
], function($, _, Backbone, BBXBaseFunctions, MediaModel, MediaCollection, MucuaModel, MediaDestaquesMucuaTpl, MediaNovidadesTpl, MediaMocambolaTpl, MediaRelatedTpl, MediaResultsTpl, MediaGridTpl, ResultsMessageTpl, SearchTagsMenuTpl){
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

    var __parseMenuSearch = function(searchTags, terms = '') {
	var config = __getConfig(),
	terms = terms || {}, // if any term is passed, do a cummulative search
	data = {};
	if (searchTags != '') {
	    data.searchTags = searchTags;
	    $("body").data("bbx").terms = searchTags;
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
	tagRemove = $(target).parents()[1],
	tagRemoveName = $(tagRemove.children[0]).html(),
	terms = _.without($('body').data('bbx').terms, tagRemoveName),
	currentUrl = Backbone.history.location.hash,
	baseUrl = currentUrl.split('search/')[0],
	termsUrl = currentUrl.split('search/')[1],
	newUrl = baseUrl + 'search/' + termsUrl.split(tagRemoveName)[0];
	
	__parseMenuSearch(terms);
	// remove last occurrence of '/'
	window.location = newUrl.substring(0, newUrl.lastIndexOf('/'));
    }
    
    var addTagMenuSearch = function(event) {
	console.log('addTag');
	$('#caixa_busca').off();
	$('#caixa_busca').keyup(function(e) {
	    if (e.keyCode == 13) {
		var terms = $('body').data('bbx').terms;
		doSearch(terms);
	    } 
	});
	
	$('#caixa_busca').focus();
	// manda foco para campo de busca
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
	    $('#destaques-mucua .media').html(_.template(MediaGridTpl, data));
	});
    };

    var getMediaByNovidades = function(el) {
	var config = __getConfig(),
	url = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/bbx/search' ;	
	
	getMedia(url, function(data){
	    $(el).append(_.template(MediaNovidadesTpl));
	    data.message = 'Nenhuma novidade em ' + config.mucua + '.';
	    $('#media-novidades .media').html(_.template(MediaGridTpl, data));
	});
    };

    var getMediaRelated = function(uuid) {
	var config = __getConfig(),
	url = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/media/' + uuid + '/related';
	
	getMedia(url, function(data){
	    $('#content').append(_.template(MediaRelatedTpl));
	    data.message = 'Nenhuma media relacionada encontrada.';
	    $('#media-related .media').html(_.template(MediaGridTpl, data));
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
	    $('#media-mocambola .media').html(_.template(MediaGridTpl, data));
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
	    $('#media-results .media').html(_.template(MediaGridTpl, data));	    
	});	
    };
    
    /**
     * execute search
     * 
     */
    var doSearch = function(terms = '') {
	console.log('doSearch');
	var term = $('#caixa_busca')[0].value,
	terms = terms || {},
	config = __getConfig(),
	url = '',
	apiUrl = '';
	apiUrl = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/bbx/search/' + term;
	if (_.isObject(terms) && _.size(terms) > 0) {
	    terms.push(term);
	    terms = terms.join('/');
	} else {
	    terms = term;
	}
	console.log(terms);
	url = '#' + config.repository      + '/' + config.mucua + '/bbx/search/' + terms;
	window.location.href = url;
	$('#imagem-busca').attr('src', config.imagePath + '/buscando.gif');
	getMediaSearch(apiUrl);
    };
    
	    
    return {
	init: init,
	__getConfig: __getConfig,
	addTagMenuSearch: addTagMenuSearch,
	deleteTagMenuSearch: deleteTagMenuSearch,
	doSearch: doSearch,
	getMedia: getMedia,
	getMediaByMucua: getMediaByMucua,
	getMediaByNovidades: getMediaByNovidades,
	getMediaByMocambola: getMediaByMocambola,
	getMediaSearch: getMediaSearch,
	getMediaRelated: getMediaRelated,
	getMediaTypes: getMediaTypes,
	getMediaLicenses: getMediaLicenses
    }
});