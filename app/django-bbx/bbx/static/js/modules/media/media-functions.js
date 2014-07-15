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
    'text!templates/common/ResultsMessage.html'
], function($, _, Backbone, BBXBaseFunctions, MediaModel, MediaCollection, MucuaModel, MediaDestaquesMucuaTpl, MediaNovidadesTpl, MediaMocambolaTpl, MediaRelatedTpl, MediaResultsTpl, MediaGridTpl, ResultsMessageTpl){
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
	var config = this.__getConfig(),
	url = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/bbx/search';
	
	this.getMedia(url, function(data){
	    $(el).append(_.template(MediaDestaquesMucuaTpl));
	    data.emptyMessage = 'Nenhuma media na mucua ' + config.mucua + ' encontrada.';
	    $('#destaques-mucua .media').html(_.template(MediaGridTpl, data));
	});
    };

    var getMediaByNovidades = function(el) {
	var config = this.__getConfig(),
	url = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/bbx/search' ;	
	
	this.getMedia(url, function(data){
	    $(el).append(_.template(MediaNovidadesTpl));
	    data.emptyMessage = 'Nenhuma novidade em ' + config.mucua + '.';
	    $('#media-novidades .media').html(_.template(MediaGridTpl, data));
	});
    };

    var getMediaRelated = function(uuid) {
	var config = this.__getConfig(),
	url = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/media/' + uuid + '/related';
	
	this.getMedia(url, function(data){
	    $('#content').append(_.template(MediaRelatedTpl));
	    data.emptyMessage = 'Nenhuma media relacionada encontrada.';
	    $('#media-related .media').html(_.template(MediaGridTpl, data));
	});
    };

    var getMediaByMocambola = function(origin, username) {
	var config = this.__getConfig(),
	url = '';
	
	if (origin == 'all') {
	    url = config.apiUrl + '/' + config.repository + '/all/mocambola/' + username + '/media';
	} else {
	    url = config.apiUrl + '/' + config.repository + config.origin + '/mocambola/' + username + '/media';
	}
	
	this.getMedia(url, function(data){
	    $('#content').append(_.template(MediaMocambolaTpl));
	    data.emptyMessage = 'Mocambola ainda nao publicou nenhum conteudo.';
	    $('#media-mocambola .media').html(_.template(MediaGridTpl, data));
	});
    };
    
    var getMediaSearch = function(url) {
	this.getMedia(url, function(data) {
	    var resultCount,
	    messageString = "",
	    config = $("body").data("bbx").config;
	    
	    // parse result message
	    if (!_.isEmpty(data.medias)) {
		resultCount = _.size(data.medias);
		messageString = (resultCount == 1) ? ' resultado' : ' resultados';
		messageString = __parseResultsMessage(resultCount + messageString);
	    } else {
		messageString = __parseResultsMessage("Nenhum resultado");
	    }	    
	    
	    $('#imagem-busca').attr('src', config.imagePath + '/buscar.png');
	    $('#content').html(_.template(MediaResultsTpl));
	    data.emptyMessage = 'Nenhuma media encontrada para essa busca';
	    $('#media-results .media').html(_.template(MediaGridTpl, data));	    
	});	
    };
    
    /**
     * execute search
     * 
     */
    var doSearch = function() {
	console.log('doSearch');
	var term = $('#caixa_busca')[0].value;
	//exclude = exclude || '',
	config = this.__getConfig(),
	url = '',
	apiUrl = '';
	apiUrl = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/bbx/search/' + term;
	url = '#' + config.repository      + '/' + config.mucua + '/bbx/search/' + term;
	window.location.href = url;
	$('#imagem-busca').attr('src', config.imagePath + '/buscando.gif');
	this.getMediaSearch(apiUrl);
    };
    
	    
    return {
	init: init,
	__getConfig: __getConfig,
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