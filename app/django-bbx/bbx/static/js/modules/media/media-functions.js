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
    'modules/media/model',
    'modules/media/collection',
    'modules/mucua/model',
    'text!templates/media/MediaDestaquesMucua.html',
    'text!templates/media/MediaNovidades.html',
    'text!templates/media/MediaGrid.html'
], function($, _, Backbone, MediaModel, MediaCollection, MucuaModel, MediaDestaquesMucua, MediaNovidades, MediaGrid){
    var init = function() {
    }

    var __getConfig = function() {
	return $("body").data("bbx").config;
    }

    // TODO: fazer uma funcao generica de buscar media
    // receber um callback para executar
    var getMedia = function(url, callback) {
	var media = new MediaModel([], {url: url});
	media.fetch({
	    success: function() {
		var mediaData = {
		    medias: media.attributes,
		    emptyMessage: 'Nenhum conteúdo em destaque.'
		};
		// callback / altera
		if (typeof callback == 'function') {
		    // execute callback
		    callback(mediaData);
		}
	    }
	})
    };		   
    
    var getMediaByMucua = function() {
	var config = this.__getConfig(),
	url = config.apiUrl + '/' + config.defaultRepository.name + '/' + config.myMucua + '/bbx/search';
	
	this.getMedia(url, function(data){
	    $('#content').prepend(_.template(MediaDestaquesMucua))
	    $('#destaques-mucua .media').html(_.template(MediaGrid, data));
	});
    };

    var getMediaByNovidades = function() {
	var config = this.__getConfig(),
	url = config.apiUrl + '/' + config.defaultRepository.name + '/' + config.myMucua + '/bbx/search' ;	
	
	this.getMedia(url, function(data){
	    $('#content').append(_.template(MediaNovidades));
	    $('#novidades .media').html(_.template(MediaGrid, data));
	});
    };

    return {
	__getConfig: __getConfig,
	getMedia: getMedia,
	getMediaByMucua: getMediaByMucua,
	getMediaByNovidades: getMediaByNovidades
    }
});