/**
 * Baobaxia
 * 2014
 * 
 * media/functions.js
 *
 *  Media related functions
 *
 */

define([
    'jquery', 
    'lodash',
    'backbone',
    'modules/bbx/functions',
    'modules/media/model',
    'modules/media/collection',
    'modules/mucua/model',
    'text!/templates/' + BBX.userLang + '/media/MediaDestaquesMucua.html',
    'text!/templates/' + BBX.userLang + '/media/MediaNovidades.html',
    'text!/templates/' + BBX.userLang + '/media/MediaMocambola.html',
    'text!/templates/' + BBX.userLang + '/media/MediaRelated.html',
    'text!/templates/' + BBX.userLang + '/media/MediaResults.html',
    'text!/templates/' + BBX.userLang + '/media/MediaGrid.html',
    'text!/templates/' + BBX.userLang + '/media/MediaList.html',
    'text!/templates/' + BBX.userLang + '/media/MessageRequest.html',
    'text!/templates/' + BBX.userLang + '/common/ResultsMessage.html',
    'text!/templates/' + BBX.userLang + '/common/SearchTagsMenu.html',
    'text!/templates/' + BBX.userLang + '/media/MediaGalleryEdit.html',
    'text!/templates/' + BBX.userLang + '/media/MediaGalleryEditItem.html',
    'text!/templates/' + BBX.userLang + '/media/MediaUpdatedMessage.html'
], function($, _, Backbone, BBXFunctions, MediaModel, MediaCollection, MucuaModel, MediaDestaquesMucuaTpl, MediaNovidadesTpl, MediaMocambolaTpl, MediaRelatedTpl, MediaResultsTpl, MediaGridTpl, MediaListTpl, MessageRequestTpl, ResultsMessageTpl, SearchTagsMenuTpl, MediaGalleryEditTpl, MediaGalleryEditItemTpl, MediaUpdatedMessageTpl){
    this.BBXFunctions = BBXFunctions;
    
    var init = function() {
	this.functions = {};
	this.functions.BBXFunctions = BBXFunctions;
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
	terms = terms.replace(/\s/g, '\/');
	return config.interfaceUrl + config.MYREPOSITORY + '/' + config.mucua + '/bbx/search/' + terms;
    }

    
    /*
     * clean terms by removing false or non-terms string from url
     */
    var __cleanTerms = function(terms) {
	var terms = _.compact(terms), // remove any false value
	    terms_size = terms.length,
	    terms_arr = [],
	    callback = callback || false;
	
	// check sortby & limit	and remove sizes
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
	return terms_arr;
    }
    
    var __parseMenuSearch = function(terms) {
	var config = __getConfig(),
	    data = {},
	    terms_arr = __cleanTerms(terms);
	
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
     * @skipCookie {Bool} bool if user don't want to set user preferences with this value
     */
    var showMediaBy = function(type, target, skipCookie) {
	var target = target || '.media-results .media',
	    type = type || '',
	    skipCookie = skipCookie || false,
	    data = $('body').data('bbx').data,
	    valid_types = ['list', 'grid'];
	
	if (typeof BBXFunctions === 'undefined') {
	    var BBXFunctions = window.BBXFunctions;
	}
	var userPrefs = BBXFunctions.getFromCookie('userPrefs');
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
	if (!skipCookie) {
	    BBXFunctions.addToCookie({'name': 'userPrefs', values: userPrefs});
	}
	
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
	    $('thead td.num_copies a').on('click', function(){ mediaSearchSort('num_copies')});
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
	window.scrollTo(0, 0);
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
	    'video/webm': 'video',
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
	    'clnc_educ':  'cópia livre para fins educacionais - não comercial',
	    'cc': 'creative commons',
	    'cc_nc': 'creative commons - não comercial',
	    'cc_ci': 'creative commons -  compartilha igual',
	    'cc_ci_nc': 'creative commons - compartilha igual - não comercial',
	    'cc_sd': 'creative commons - sem derivação',
	    'cc_sd_nc': 'creative commons - sem derivação - não comercial'
	}
    };

    var getMedia = function(url, callback, params) {
	var params = params || {},
	    media = new MediaModel([], {url: url});
	
	$('#content').append('<div class="loading-content"><img src="images/buscando.gif" /></div>');	
	media.fetch({
	    success: function() {
		$('#content .loading-content').remove();
		var mediaData = {
		    formatDate: function(date) {
			var newDate = '',
			    re = /^(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)[\.0-9]*Z$/,
			    matches = date.match(re);
			
			return matches[3] + '/' + matches[2] + '/' + matches[1];
		    }
		};
		var medias = {};
		
		$('#back-to-results').remove();

		if (!_.isEmpty(media.attributes) ) {
		    if (!_.isObject(media.attributes[0])) {
			medias[0] = media.attributes;
		    } else {
			medias = media.attributes;
		    }
		    mediaData.params = params;
		    mediaData.parseThumb = parseThumb;
		} else {
		    // no content found
		    medias = {};
		    $('.loading-content').remove();		    
		}

		mediaData.medias = medias;
		
		// callback / altera
		if (typeof callback == 'function') {
		    // execute callback
		    callback(mediaData);
		    var mediaLength = _.size(mediaData.medias),
		    message = "";
		    
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

    var parseThumb = function(media, params) {
	var url = BBX.config.apiUrl + '/' + BBX.config.repository + '/' + BBX.config.mucua + '/media/' + media.uuid + '/' + params.width + 'x' + params.height + '.' + media.format,
	    mediaLoad = [];
	
	mediaLoad[media.uuid] = new MediaModel([], {url: url});
	mediaLoad[media.uuid].fetch({
 	    success: function() {
		media.url = mediaLoad[media.uuid].attributes.url;
		var tmpImage = new Image();
		tmpImage.src = media.url;
		tmpImage.onload = function() {
		    if ($('#media-' + media.uuid).length) {
			$('#media-' + media.uuid).removeClass('image-tmp');
			$('#media-' + media.uuid).attr('src', media.url)
			
		    } else {
			$('.media-image-container').prepend('<img id="media-' + media.uuid + '" src="' + media.url + '" />');
		    }
		    var width = (params.width !== '00' && params.width < tmpImage.naturalWidth) ? params.width : tmpImage.naturalWidth;
		    var height = (params.height !== '00' && params.height < tmpImage.naturalHeight) ? params.height : tmpImage.naturalHeight;
  		    $('#media-' + media.uuid).attr('width', width);
		    $('#media-' + media.uuid).attr('height', height);
		}
	    }
	});
    }
    
    var getTagCloud = function(el) {
	/*
	  
	  $.fn.tagcloud.defaults = {
	  size: {start: 10, end: 16, unit: 'pt'},
	  color: {start: '#fada53', end: '#fada53'}
	  };
	  
	  $(function () {
	  $('#tag_cloud a').tagcloud();
	  });
	  }
	  });	 
	*/   
    }

    var getMediaByLimit = function(el, limit) {
	var config = __getConfig(),
	    limit = limit || '',
	    url = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/bbx/search/';
	
	if (limit !== '') {
	    url += 'limit/' + limit;
	}
	
	getMedia(url, function(data){
	    __parseMenuSearch();
	    $(el).html(_.template(MediaDestaquesMucuaTpl));
	    data.message = 'Nenhuma media na mucua ' + config.mucua + ' encontrada.';
	    
	    $('body').data('bbx').data = data;
	    showMediaBy('grid', '#destaques-mucua .media');
	}, {'width': 190, 'height': 132 });
    };
    
    var getMediaByMucua = function(el, limit) {
	var config = __getConfig(),
	    defaultLimit = 4,
	    limit = limit || defaultLimit,
	    url = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/bbx/search/limit/' + limit ;
	
	getMedia(url, function(data){
	    __parseMenuSearch();
	    $(el).append(_.template(MediaDestaquesMucuaTpl));
	    data.message = 'Nenhuma media na mucua ' + config.mucua + ' encontrada.';
	    
	    $('body').data('bbx').data = data;
	    showMediaBy('grid', '#destaques-mucua .media', true);
	}, {'width': 190, 'height': 132 });
    };

    var getMediaByNovidades = function(el, limit) {
	var config = __getConfig(),
	    defaultLimit = 4,
	    limit = limit || defaultLimit,
	    url = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/bbx/search/orderby/date/desc/limit/' + limit;
	
	console.log('getMediaByNovidades');
	
	getMedia(url, function(data){
	    $(el).append(_.template(MediaNovidadesTpl));
	    data.message = 'Nenhuma novidade em ' + config.mucua + '.';

	    // TODO: quando tem mais de um bloco de dados (ex: ultimas novidades E conteudo destacado), pensar em como guardar duas ou mais listas de media
	    $('body').data('bbx').data = data;
	    showMediaBy('grid', '#novidades-mucua .media', true);
	    //$('.media-display-type .grid').on('click', function(){ showMediaBy('grid')});	    
	    //$('.media-display-type .list').on('click', function(){ showMediaBy('list')});	    
	}, {'width': 190, 'height': 132 });
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

    var getMediaByMocambola = function(origin, username, limit) {
	var config = __getConfig(),
	    url = '',
	    limit = limit || '';
	
	if (limit !== '') {
	    limit = 'limit/' + limit; 
	}
	
	if (origin == 'all') {
	    url = config.apiUrl + '/' + config.repository + '/all/mocambola/' + username + '/media/' + limit;
	} else {
	    url = config.apiUrl + '/' + config.repository + config.origin + '/mocambola/' + username + '/media/' + limit;
	}
	
	getMedia(url, function(data){
	    $('#content').append(_.template(MediaMocambolaTpl));
	    data.message = 'Mocambola ainda nao publicou nenhum conteudo.';
	    
	    $('body').data('bbx').data = data;
	    showMediaBy('', '#media-mocambola .media');

	    if (url.match('limit')) {
		$('.media-display-type .all').css("background", "url(/images/all-on.png)");
	    } else {
		$('.media-display-type .all').css("background", "url(/images/all-off.png)");
	    }
	    var click = $('.media-display-type .all').data('events');
	    if (typeof click === 'undefined') {
		if (url.match('limit')) {
		    $('.media-display-type .all').css("background", "url(/images/all-on.png)");
		} else {
		    $('.media-display-type .all').css("background", "url(/images/all-off.png)");
		}
		$('.media-display-type .all').on('click', function(){ changeMediaLimit(1000, url)});	    
		$('.media-display-type .grid').on('click', function(){ showMediaBy('grid')});	    
		$('.media-display-type .list').on('click', function(){ showMediaBy('list')});	    
	    }
	}, {'width': 190, 'height': 132 });
    };

    var getMediaGallery= function(url, limit) {
	var limit = limit || '';
	
	if (limit !== '') {
	    url += '/limit/' + limit;
	}
	
	getMedia(url, function(data) {
	    var __getFormData = function(uuid) {
		var fields = {},
		    className = '.' + uuid,
		    media = {};
		
		$(className).each(function() {
		    var fieldName = this.name.replace('-' + uuid, '');
		    fields[fieldName] = this.value;
		});
		media = {
		    name: fields.name,
		    uuid: fields.uuid,
		    origin: fields.origin,
		    author: fields.author,
		    repository: fields.repository,
		    tags: fields.tags,
		    license: fields.license,
		    date: fields.date,
		    type: fields.type,
		    note: fields.note,		
		    media_file: fields.media_file
		}
		return media;
	    }
	    
	    
	    var resultCount,
		messageString = "",
		terms = {},
		config = $("body").data("bbx").config,	    
		terms = url.match(/search\/(.*)$/)[1].split('/');
	    
	    data.pageTitle = "Gallery edit";
	    data.types = getMediaTypes(),
	    data.licenses = getMediaLicenses();
	    data.parseThumb = parseThumb;
	    data.baseUrlEdit = config.interfaceUrl + config.repository + '/' + config.mucua + '/media/',
	    
	    $('#content').html(_.template(MediaGalleryEditTpl, data));
	    _.each(data.medias, function(media) {
		data.media = media;
		$('#media-gallery-edit tbody').append(_.template(MediaGalleryEditItemTpl, data));
	    });

	    // bind events filling
	    $('.all-name').keyup(function() {
		$('.name').val($('.all-name').val());
	    });
	    $('.all-date').keyup(function() {
		$('.date').val($('.all-date').val());
	    });
	    $('.all-tags').keyup(function() {
		$('.tags').val($('.all-tags').val());
	    });

	    $('.save-all').click(function() {
		console.log('save all');
	    });	    
	    
	    $('.save-media-item').click(function(el) {
		console.log('save item');
		var id = el.currentTarget.id.replace('uuid-', ''),
		    urlUpdateItem = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/media/' + id,
		    mediaData = __getFormData(id),
		    media = null,
		    options = {};
		
		media = new MediaModel([mediaData], {url: urlUpdateItem});
		options.beforeSend = function(xhr){
		    xhr.setRequestHeader('X-CSRFToken', $.cookie('csrftoken'));
		}
		console.log('try to save');
		//HACK para passar o objeto corretamente
		media.attributes =  _.clone(media.attributes[0]);
		Backbone.sync('update', media, options).done(function(){
		    
		    $(el.currentTarget).append(MediaUpdatedMessageTpl);
		    setTimeout(function(){$('.save-media-item h3.message').fadeOut(2000)}, 2000);
		});		    
	    });
	    
	}, {'width': 130, 'height': 90 });	    
    };
    
    var getMediaSearch = function(url, limit) {
	var limit = limit || '';
	
	if (limit !== '') {
	    url += '/limit/' + limit;
	}
	console.log(url);
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
	    
	    if (url.match('limit')) {
		$('.media-display-type .all').css("background", "url(/images/all-on.png)");
	    } else {
		$('.media-display-type .all').css("background", "url(/images/all-off.png)");
	    }
	    
	    // todo: verificar se ja existe um evento associado; se nao tiver, adiciona - quebrado
	    var click = $('.media-display-type .all').data('events');
	    if (typeof click === 'undefined') {
		if (url.match('limit')) {
		    $('.media-display-type .all').css("background", "url(/images/all-on.png)");
		} else {
		    $('.media-display-type .all').css("background", "url(/images/all-off.png)");
		}
		$('.media-display-type .all').on('click', function(){ changeMediaLimit(1000)});	    
		$('.media-display-type .grid').on('click', function(){ showMediaBy('grid')});	    
		$('.media-display-type .list').on('click', function(){ showMediaBy('list')});	    
	    }
	}, {'width': 190, 'height': 132 });
    };
       
    /* 
     * changeMediaLimit
     *
     * @limit {integer} number of objects to limit the query
     * @urlApi {string} optional string for passing urlApi; by default it's the bbx/search url
     * @return {void} return action is changing url
     
     */
    var changeMediaLimit = function(limit, urlApi) {
	var url = Backbone.history.location.href,
	    urlApi = urlApi || BBX.config.apiUrl + '/' + BBX.config.repository + '/' + BBX.config.mucua + '/bbx/search/';
	
	console.log('change media limit');
	console.log(urlApi);
	if (url.match('limit')) {
	    url = url.split('/limit')[0];
	} else {
	    url += '/limit/1000';
	}
	window.location.replace(url);
    }

    var requestCopy = function(uuid) {
	console.log('content ' + uuid + ' requested');
	
	var urlRequest = BBX.config.apiUrl + '/' + BBX.config.repository + '/' + BBX.config.mucua + '/media/' + uuid + '/request',
	    requestedCopy = new MediaModel([], {url: urlRequest});
	
	requestedCopy.fetch({
	    success: function() {
		var data = {
		    media: {
			is_requested: true
		    }
		}
		$('#message-request').html(_.template(MessageRequestTpl, data));
		$('.request-copy').addClass('requested-copy').removeClass('request-copy');
	    }
	})
    }
    
    var bindRequest = function(uuid) {
	$('.request-copy').on('click', function() { requestCopy(uuid) });   
    }

    var mediaSearchSort = function(field) {
	var url = Backbone.history.location.href,
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

	    url = matches[1] + '/orderby/' + field + ordering_type + '/limit/' + matches[2];
	// bbx/search
	} else {
	    console.log('else');
	    ordering_type = __check_ordering(url);
	    url += '/orderby/' + field + ordering_type;
	}
	
	window.location.replace(url);
    }
    
    return {
	init: init,
	__getConfig: __getConfig,
	showMediaBy: showMediaBy,
	getMedia: getMedia,
	getMediaGallery: getMediaGallery,
	getMediaByLimit: getMediaByLimit,
	getMediaByMucua: getMediaByMucua,
	getMediaByNovidades: getMediaByNovidades,
	getMediaByMocambola: getMediaByMocambola,
	getMediaSearch: getMediaSearch,
	getMediaRelated: getMediaRelated,
	getMediaTypes: getMediaTypes,
	getMediaLicenses: getMediaLicenses,
	getTypeByMime: getTypeByMime,
	bindRequest: bindRequest,
	requestCopy: requestCopy,
	mediaSearchSort: mediaSearchSort,
	getTagCloud: getTagCloud,
	__cleanTerms: __cleanTerms,
	parseThumb: parseThumb
    }
});
