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
    'text!templates/media/MediaRelated.html',
    'text!templates/media/MediaResults.html',
    'text!templates/media/MediaGrid.html'
], function($, _, Backbone, BBXBaseFunctions, MediaModel, MediaCollection, MucuaModel, MediaDestaquesMucuaTpl, MediaNovidadesTpl, MediaRelatedTpl, MediaResultsTpl, MediaGridTpl){
    var init = function() {
    }

    var __getConfig = function() {
	return $("body").data("bbx").config;
    }

    var getMedia = function(url, callback) {
	var media = new MediaModel([], {url: url});
	media.fetch({
	    success: function() {
		console.log(media);
		var mediaData = {
		    medias: media.attributes
		};
		// callback / altera
		if (typeof callback == 'function') {
		    // execute callback
		    callback(mediaData);
		}
	    }
	});
    }		   
    
    var getMediaByMucua = function() {
	var config = this.__getConfig(),
	url = config.apiUrl + '/' + config.defaultRepository.name + '/' + config.myMucua + '/bbx/search';
	
	this.getMedia(url, function(data){
	    $('#content').prepend(_.template(MediaDestaquesMucuaTpl));
	    $('#destaques-mucua .media').html(_.template(MediaGridTpl, data));
	});
    };

    var getMediaByNovidades = function() {
	var config = this.__getConfig(),
	url = config.apiUrl + '/' + config.defaultRepository.name + '/' + config.myMucua + '/bbx/search' ;	
	
	this.getMedia(url, function(data){
	    $('#content').append(_.template(MediaNovidadesTpl));
	    $('#media-novidades .media').html(_.template(MediaGridTpl, data));
	});
    };

    var getMediaRelated = function(uuid) {
	var config = this.__getConfig(),
	url = config.apiUrl + '/' + config.defaultRepository.name + '/' + config.myMucua + '/media/' + uuid + '/related';
	
	this.getMedia(url, function(data){
	    $('#content').append(_.template(MediaRelatedTpl));
	    $('#media-related .media').html(_.template(MediaGridTpl, data));
	});
    };
    
    var getMediaSearch = function(url) {
	this.getMedia(url, function(data) {
	    var resultCount,
	    messageString = "",
	    config = $("body").data("bbx").config;
	    
	    if (!_.isEmpty(data.medias)) {
		resultCount = _.size(data.medias);
		messageString = (resultCount == 1) ? ' resultado' : ' resultados';
		messageString = resultCount + messageString;
	    } else {
		messageString = "Nenhum resultado";
	    }
	    $('#result-string').html(messageString);
	    $('#imagem-busca').attr('src', config.imagePath + '/buscar.png');
	    $('#content').html(_.template(MediaResultsTpl));
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
	mucuaToSearch = '',
	reMucuaSearch = /^\w+\/([a-zA-Z0-9\-]+)/,
	tmpMucua = Backbone.history.fragment.match(reMucuaSearch);
	mucuaToSearch = tmpMucua[1];
	// TODO: debugar mais essa porcao
	url = config.apiUrl + '/' + config.defaultRepository.name + '/' + mucuaToSearch + '/bbx/search/';
	
	// tratamento do term
	url += term;
	
	$('#imagem-busca').attr('src', config.imagePath + '/buscando.gif');
	this.getMediaSearch(url);
    };
    
	    
    return {
	__getConfig: __getConfig,
	doSearch: doSearch,
	getMedia: getMedia,
	getMediaByMucua: getMediaByMucua,
	getMediaByNovidades: getMediaByNovidades,
	getMediaSearch: getMediaSearch,
	getMediaRelated: getMediaRelated
    }
});