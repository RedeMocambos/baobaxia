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
    this.BBXBaseFunctions = BBXBaseFunctions;
    
    var init = function() {
	this.functions = {};
	this.functions.BBXBaseFunctions = BBXBaseFunctions;
    }

    var __getConfig = function() {
	return $("body").data("bbx").config;
    }
    
    var __parseResultsMessage = function(message) {
	var target = target || '#result-string',
	imageTag = '',
	data = {
	    config: __getConfig(),
	    message: message
	}
	
	$(target).html(_.template(ResultsMessageTpl, data));	
    };    

    var __parseUrlSearch = function(terms) {
	var config = __getConfig();
	return config.interfaceUrl + config.MYREPOSITORY + '/' + config.mucua + '/bbx/search/' + terms;
    }

    var __parseMenuSearch = function(terms) {
	var config = __getConfig(),
	data = {};
	terms = _.compact(terms); // remove any false value
	console.log(terms);
	$("body").data("bbx").terms = terms;
	$('#caixa_busca')
	    .textext({ plugins: 'tags',
		       tagsItems: terms,
		       ext: {
			   tags: {
			       removeTag: function(el) {
				   console.log('remove');
				   var termRemove = $(el).children().children().html(),
				   terms = config.subroute.split('bbx/search/')[1].replace(termRemove, '');
				   terms = terms.replace('//', '/');		   
				   terms = (terms[terms.length -1] == '/') ? terms.substring(0, terms.length -1) : terms;
				   
				   window.location = __parseUrlSearch(terms);
			       }
			   }
		       }
		     })
	    .bind('tagClick', function(e, tag, value, callback) {
		console.log('tag click');
		
		window.location = __parseUrlSearch(value);
	    })
	    .bind('enterKeyPress', function(e) {
		console.log('enter');
		
		var textext = $(e.target).textext()[0],
		terms = textext.hiddenInput().val(),
		terms_str = '';
		terms_str = terms.match(/\[(.*)\]/)[1].replace(/"/g, '').replace(/,/g, '/');
		window.location = __parseUrlSearch(terms_str);
	    })
	    .bind('removeTag', function(tag) {
		console.log('removeTag: ' + tag);
	    });	
    }

    var setUserPrefs = function() {
	var userPrefs = {'name': 'userPrefs',
			 'values': {}
			}
	// default
	userPrefs.values.media_listing_type = 'grid' ;
	return userPrefs;
    }

    /**
     * change media results view
     *
     * @type {String} string of type, of a predefined list of types
     * @target {String} string of DOM class/id mapping
     */
    var showMediaBy = function(type, target) {
	var target = target || '.media-results .media',
	type = type || '',
	data = $('body').data('bbx').data,
	valid_types = ['list', 'grid'];
	
	if (typeof BBXBaseFunctions === 'undefined') {
	    var BBXBaseFunctions = window.BBXBaseFunctions;
	}
	var userPrefs = BBXBaseFunctions.getFromCookie('userPrefs');
	if (_.isEmpty(userPrefs)) {
	    userPrefs = setUserPrefs();
	}

	// se vazio, pega default
	type = (type == '') ? userPrefs.values.media_listing_type : type;
	// se invalido, cai fora
	
	if (!_.contains(valid_types, type)) {
	    console.log('false type');
	}
	
	// seta novo media-listing-type
	userPrefs.values.media_listing_type = type;
	BBXBaseFunctions.addToCookie({'name': 'userPrefs', values: userPrefs});
	
	switch(type) {
	case 'grid':
	    $(target).html(_.template(MediaGridTpl, data));
	    break;
	case 'list':
	    $(target).html(_.template(MediaListTpl, data));
	    break;
	}
	_.each(valid_types, function (type_name) {
	    if (type_name == type) {
		$(target).removeClass().addClass('media media-' + type_name);
		$('.media-display-type .' + type_name).css("background", "url(/images/" + type_name + "-on.png)");
	    } else {
		$('.media-display-type .' + type_name).css("background", "url(/images/" + type_name + "-off.png)");
	    }	    
	});
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
		    var mediaLength = _.size(mediaData.medias);
		    var message = "";
		    if (mediaLength > 1) {
			message = "Exibindo " + _.size(mediaData.medias) + " resultados" ;
		    } else if (mediaLength == 1) {
			message = "Exibindo " + _.size(mediaData.medias) + " resultado" ;
		    } else if (mediaLength === 0) {
			message = "Nenhum resultado encontrado";
		    }
		    $('#medias-length').html(message);
		}
	    }
	});
    }		   
    
    var getMediaByMucua = function(el) {
	var config = __getConfig(),
	url = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/bbx/search';
	
	getMedia(url, function(data){
	    __parseMenuSearch();
	    $(el).append(_.template(MediaDestaquesMucuaTpl));
	    data.message = 'Nenhuma media na mucua ' + config.mucua + ' encontrada.';
	    
	    $('body').data('bbx').data = data;
	    showMediaBy('', '#destaques-mucua .media');
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
	    showMediaBy('', '#media-novidades .media');
	    $('.media-display-type .grid').on('click', function(){ showMediaBy('grid')});	    
	    $('.media-display-type .list').on('click', function(){ showMediaBy('list')});	    
	});
    };

    var getMediaRelated = function(uuid) {
	var config = __getConfig(),
	url = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/media/' + uuid + '/related';
	
	getMedia(url, function(data){
	    $('#content').append(_.template(MediaRelatedTpl));
	    data.message = 'Nenhuma media relacionada encontrada.';

	    $('body').data('bbx').data = data;
	    showMediaBy('', '#media-related .media');
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
	    showMediaBy('', '#media-mocambola .media');
	    $('.media-display-type .grid').on('click', function(){ showMediaBy('grid')});	    
	    $('.media-display-type .list').on('click', function(){ showMediaBy('list')});	    
	});
    };
    
    var getMediaSearch = function(url) {
	getMedia(url, function(data) {
	    var resultCount,
	    messageString = "",
	    terms = {},
	    config = $("body").data("bbx").config,	    
	    terms = url.match(/search\/(.*)$/)[1].split('/');
	    
	    __parseMenuSearch(terms);
	    
	    // parse result message
	    if (!_.isEmpty(data.medias)) {
		resultCount = _.size(data.medias);
		messageString = (resultCount == 1) ? resultCount + ' resultado' : resultCount + ' resultados';
	    } else {
		messageString = "Nenhum resultado";
	    }	    
	    
	    $('#imagem-busca').attr('src', config.imagePath + '/buscar.png');
	    $('#content').html(_.template(MediaResultsTpl));
	    data.message = 'Nenhuma media encontrada para essa busca';
	    
	    $('body').data('bbx').data = data;
	    showMediaBy('', '#media-results .media');
	    $('.media-display-type .grid').on('click', function(){ showMediaBy('grid')});	    
	    $('.media-display-type .list').on('click', function(){ showMediaBy('list')});	    
	});	
    };
    
    return {
	init: init,
	__getConfig: __getConfig,
	showMediaBy: showMediaBy,
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