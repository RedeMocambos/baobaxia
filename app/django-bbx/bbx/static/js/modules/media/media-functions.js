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
	data = {},
	terms = _.compact(terms), // remove any false value
	terms_arr = [], 
	terms_size = terms.length; 	
	
	// check sortby & limit
	if (terms.length > 0) {
	    var term = '',
	    t = 0;
	    for (var t = 0; t < terms_size; t++) {
		term = terms[t];
		if (term == 'orderby' || term == 'limit') {
		    t = terms_size;
		} else {
		    terms_arr.push(term);
		}	    
	    }
	}
	
	$("body").data("bbx").terms = terms;
	$('#caixa_busca')
	    .textext({ plugins: 'tags',
		       tagsItems: terms_arr,
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
	    
	    // get ordering; default: name
	    // TODO: invert arrow according to order type (asc|desc)
	    var orderby = 'name',
	    orderbyType = 'asc',
	    url = Backbone.history.location.href,
	    matchesOrderby = url.match('orderby/([a-zA-Z]*)/'),
	    matchesOrderbyType = url.match('orderby/[a-zA-Z]*/([asc|desc]*)[/]*');
	    
	    if (matchesOrderby) {
		orderby = matchesOrderby[1];
	    }
	    if (matchesOrderbyType) {
		orderbyType = matchesOrderbyType[1];
	    }
	    
	    $('thead td.' + orderby).addClass('orderby');
	    $('thead td.' + orderby + ' div').removeClass().addClass('orderby_' +  orderbyType);
	    
	    $('thead td.name a').on('click', function(){ mediaSearchSort('name')});
	    $('thead td.author a').on('click', function(){ mediaSearchSort('author')});
	    $('thead td.format a').on('click', function(){ mediaSearchSort('format')});
	    $('thead td.origin a').on('click', function(){ mediaSearchSort('origin')});
	    $('thead td.date a').on('click', function(){ mediaSearchSort('date')});
	    $('thead td.license a').on('click', function(){ mediaSearchSort('license')});
	    $('thead td.type a').on('click', function(){ mediaSearchSort('type')});
	    $('thead td.is_local a').on('click', function(){ mediaSearchSort('is_local')});
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
	    'image/png': 'imagem',
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
	$('#content').append('<div id="loading-content"><img src="images/buscando.gif" /></div>');	
	media.fetch({
	    success: function() {
		$('#content').remove("#loading-content");
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

    var mediaSearchSort = function(field) {
	var url = Backbone.history.location.href;
	matches = '',
	reUrl = '',
	matches = null,
	ordering_type = '/asc';
	
	if (!url.match('bbx/search')) {
	    //http://namaste/#mocambos/namaste/limit/100
	    matches = url.match('(.*)/limit/(.*)$');
	    if (matches) {
		url = matches[1] + '/bbx/search/limit/' + matches[2];
	    //http://namaste/#mocambos/namaste		
	    } else { 
		url += '/bbx/search';
	    }
	}
	
	__check_ordering = function(url) {
	    if (url.match('asc')) {
		return '/desc';
	    } else if (url.match('desc')) {
		return '/asc';
	    } else {
		return '/asc'
	    }
	}

	// bbx/search/quiabo/orderby/is_local/limit/100
	if (url.match('/orderby/') && url.match('/limit/')) {
	    console.log('order && limit');
	    reUrl = 'orderby\/(.*)\/limit';
	    matches = url.match(reUrl);
	    old_field = matches[1];
	    ordering_type = (old_field == field + ordering_type) ? __check_ordering(url) : ordering_type;
	    
	    url = url.replace(old_field, field + ordering_type);
	    
        // bbx/search/quiabo/orderby/is_local
	} else if (url.match('/orderby/') && !url.match('/limit/')) {
	    console.log('order');
	    reUrl = 'orderby\/(.*)$';
	    matches = url.match(reUrl);
	    old_field = matches[1];
	    
	    ordering_type = (old_field == field + ordering_type) ? __check_ordering(url) : ordering_type;
	    url = url.replace(old_field, field + ordering_type);
	    
	// bbx/search/quiabo/limit/100
	} else if (url.match('/limit/')) {
	    console.log('limit');
	    reUrl = '(.*)\/limit\/(.*)';
	    matches = url.match(reUrl);
	    
	    ordering_type = __check_ordering(url);

	    url = matches[1] + 'orderby/' + field + ordering_type + '/limit/' + matches[2];
	// bbx/search
	} else {
	    console.log('else');
	    ordering_type = __check_ordering(url);
	    url += '/orderby/' + field + ordering_type;
	}
	
	window.location.href = url;
    }
    
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
	getTypeByMime: getTypeByMime,
	mediaSearchSort: mediaSearchSort
    }
});
