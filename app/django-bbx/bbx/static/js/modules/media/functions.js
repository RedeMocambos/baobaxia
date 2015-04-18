/**
 * Media related functions
 * @module media/functions
 */

define([
    'jquery', 
    'lodash',
    'backbone',
    'tagcloud',
    'fancybox',
    'fancybox_buttons',
    'fancybox_media',
    'textext',
    'textext_ajax',
    'textext_autocomplete',
    'modules/bbx/functions',
    'modules/media/model',
    'modules/media/collection',
    'modules/mucua/model',
    'modules/tag/model',
    'text!/templates/' + BBX.userLang + '/media/MediaDestaquesMucua.html',
    'text!/templates/' + BBX.userLang + '/media/MediaNovidades.html',
    'text!/templates/' + BBX.userLang + '/media/MediaMocambola.html',
    'text!/templates/' + BBX.userLang + '/media/MediaRelated.html',
    'text!/templates/' + BBX.userLang + '/media/MediaResults.html',
    'text!/templates/' + BBX.userLang + '/media/MediaGrid.html',
    'text!/templates/' + BBX.userLang + '/media/MediaList.html',
    'text!/templates/' + BBX.userLang + '/media/MediaPagination.html',
    'text!/templates/' + BBX.userLang + '/media/MessageRequest.html',
    'text!/templates/' + BBX.userLang + '/common/ResultsMessage.html',
    'text!/templates/' + BBX.userLang + '/common/SearchTagsMenu.html',
    'text!/templates/' + BBX.userLang + '/common/TagCloud.html',
    'text!/templates/' + BBX.userLang + '/common/MessageSearch.html',
    'text!/templates/' + BBX.userLang + '/media/MediaGalleryEdit.html',
    'text!/templates/' + BBX.userLang + '/media/MediaGalleryEditItem.html',
    'text!/templates/' + BBX.userLang + '/media/MediaUpdatedMessage.html',
    'text!/templates/' + BBX.userLang + '/media/MediaUpdateErrorMessage.html'
], function($, _, Backbone, TagCloud, Fancybox, FancyboxButtons, FancyboxMedia, Textext, TextextAjax, TextextAutocomplete, BBXFunctions, MediaModel, MediaCollection, MucuaModel, TagModel, MediaDestaquesMucuaTpl, MediaNovidadesTpl, MediaMocambolaTpl, MediaRelatedTpl, MediaResultsTpl, MediaGridTpl, MediaListTpl, MediaPaginationTpl, MessageRequestTpl, ResultsMessageTpl, SearchTagsMenuTpl, TagCloudTpl, MessageSearchTpl, MediaGalleryEditTpl, MediaGalleryEditItemTpl, MediaUpdatedMessageTpl, MediaUpdateErrorMessageTpl){
    /**
     * Funções gerais de media
     *
     * @exports media/functions
     */

    /** @global */
    this.BBXFunctions = BBXFunctions;
    
    var init = function() {
	/** Inicializa media functions */
	this.functions = {};
	this.functions.BBXFunctions = BBXFunctions;
    }

    /**
     * Retorna configuracoes gerais
     *
     * @returns {Object} Objeto de configurações
     */    
    var __getConfig = function() {
	return BBX.config;
    }

    /**
     * Dá saída de mensagem de restultados
     *
     * @param {String} message String de mensagem
     * @returns {None} [Conteúdo definido pelo jquery]
     */    
    var __parseResultsMessage = function(message) {
	var target = target || '#result-string',
	    imageTag = '',
	    data = {
		config: __getConfig(),
		message: message
	    }
	
	$(target).html(_.template(ResultsMessageTpl, data));	
    };    

    /**
     * Define url de busca
     *
     * @param {Array} tags Array de tags/termos
     * @returns {String} String URL com busca a partir das tags recebidas
     */        
    var __parseUrlSearch = function(tags) {
	var config = __getConfig();
	
	if (_.isArray(tags)) {
	    tags = tags.join('/');
	}
	// remove last and first char if is a /
	tags = (tags[tags.length -1] === '/') ? tags.substring(0, tags.length -1) : tags;
	while (tags[0] === '/') {
	    tags = (tags[0] === '/') ? tags.substring(1, tags.length) : tags;
	}
	tags = tags.replace('//', '/');
	
	return config.interfaceUrl + config.MYREPOSITORY + '/' + config.mucua + '/bbx/search/' + tags;
    }

    /**
     * Retorna tags a partir da url
     *
     * @returns {Array} Array de tags/termos
     */        
    var __getTagsFromUrl = function() {
	var url_has_order = false,
	    url_has_limit = false,
	    url_is_search = false,
	    url_is_gallery = false,
	    tags = [],
	    current_url = decodeURI(Backbone.history.fragment);
	
	url_is_search = current_url.indexOf('bbx/search');
	url_is_gallery = current_url.indexOf('gallery');
	url_has_order = current_url.indexOf('/orderby');
	url_has_limit = current_url.indexOf('/limit');
	
	// remove order & limit of url
	if (url_has_order > 0) {
	    current_url = current_url.slice(0, url_has_order);
	} else if (url_has_order < 0 && url_has_limit > 0) {
	    current_url = current_url.slice(0, url_has_limit);
	}
	
	// identify type of url
	if (url_is_search > 0) {
	    current_url = current_url.split('bbx/search/');
	    if (typeof current_url[1] !== 'undefined') {
		tags = current_url[1];
	    }
	} else if (url_is_gallery > 0) {
	    tags = current_url.split('gallery/')[1];
	    if (current_url.match('edit')) {
		tags = tags.split('/edit')[0];
	    }
	} else {
	    // other kind of url
	}

	if (_.isString(tags)) {
	    tags = tags.split('/');
	}

	tags = _.compact(tags);

	return tags;
    }
    
    /**
     * Dá saída do menu de busca
     */    
    var __parseMenuSearch = function() {
	var config = __getConfig(),
	    data = {},
	    tags_arr = __getTagsFromUrl(),
	    tags_str = tags_arr.join('/'),
	    urlApiTags = config.apiUrl + '/' + config.MYREPOSITORY + '/' + config.MYMUCUA + '/tags/search/';

	if (!_.isEmpty(tags_arr)) {
	    $('#caixa_busca').val('');
	} else {
	    $('#caixa_busca').html(_.template(MessageSearchTpl));
	    $('#caixa_busca').css('color', '#bbb');
	}
	var limpaBusca = function() {
	    $('#caixa_busca').val('');
	    $('#caixa_busca').css('color', '#000');
	}
	
	$('#caixa_busca')
	    .textext({ plugins: 'tags',
		       tagsItems: tags_arr,
		       ext: {
			   tags: {
			       removeTag: function(el) {
				   console.log('remove');
				   var tagRemove = $(el).children().children().html(),
				       tags = tags_str.replace(tagRemove, '');
				   
				   window.location = __parseUrlSearch(tags);
			       }
			   }
		       }
		     })
	    .bind('tagClick', function(e, tag, value, callback) {
		window.location = __parseUrlSearch(value);
	    })
	    .bind('enterKeyPress', function(e) {
		var textext = $(e.target).textext()[0],
		    tags = textext.hiddenInput().val(),
		    tags_str = '';

		// interpretador da busca com espaços e aspas
		// adiciona separador ao espaço antes da aspa, depois da aspa e identifica dentro das aspas como um elemento único
		tags = tags.replace(/\s+\\"{1}/,'/').replace(/\\"{1}\s+/,'/').replace(/\\"(.*)\\"\s*/g, '$1/');
		// remove caracteres não desejados
		tags_str = tags.match(/\[(.*)\]/)[1].replace(/\\"/g, '').replace(/,/g, '/').replace(/"/g, '');

		// TODO: pensar como resolver algumas questões de busca
		// -> a busca atual pega: ["mercado sul" ocupação], mas não pega [mercado sul ocupação] (considera como uma tag)
		
		window.location = __parseUrlSearch(tags_str);
	    })
	    .bind('removeTag', function(tag) {
		console.log('removeTag: ' + tag);
	    })
	    .bind('click', function() {
		limpaBusca();
	    })
	    .bind('focus', function() {
		limpaBusca();
	    });
	
    }

    /**
     * Define preferencias de usuário
     *
     * @returns {Object} Objeto com preferências do usuário
     */    
    var setUserPrefs = function(userPrefs, property) {
	var userPrefs = userPrefs || null,
	    property = property || null;

	if (!userPrefs) {
	    userPrefs = {'name': 'userPrefs',
			 'values': {}
			}
	    // default
	    userPrefs.values.media_listing_type = 'grid' ;
	}
	
	if (_.isObject(property)) {
	    userPrefs.values[property.name] = property.values;
	}
	
	return userPrefs;
    }

    /**
     * 
     */
    var getUserPrefs = function() {
	if (!this.BBXFunctions.isCookiesEnabled()) {
	    var userPrefs = {
		'name': 'userPrefs',
		values: {'media_listing_type' : 'list'}
	    };
	    return userPrefs;
	}
	
	var BBXFunctions = window.BBXFunctions,
	    userPrefs = BBXFunctions.getFromCookie('userPrefs');
	if (_.isEmpty(userPrefs)) {
	    userPrefs = setUserPrefs();
	    BBXFunctions.addToCookie({'name': 'userPrefs', values: userPrefs});
	}
		
	return userPrefs;
    }

    /**
     * Exibir medias por um critério dado
     * 
     * @public
     * @param {String} type String do tipo, de uma lista predefinida de tipos
     * @param {String} target string do elemento HTML DOM (classe/id)
     * @param {Bool} skipCookie booleano se usuário não quiser setar preferencias de usuário com esse valor
     */
    var showMediaBy = function(type, target, skipCookie) {
	var target = target || '.media-results .media',
	    type = type || '',
	    skipCookie = skipCookie || false,
	    data = BBX.data,
	    valid_types = ['list', 'grid'];
	
	if (typeof BBXFunctions === 'undefined') {
	    var BBXFunctions = window.BBXFunctions;
	}
	var userPrefs = getUserPrefs();
	
	// se vazio, pega default
	type = (type == '') ? userPrefs.values.media_listing_type : type;
	// se invalido, cai fora
	
	if (!_.contains(valid_types, type)) {
	    console.log('false type');
	}
	
	// seta novo media-listing-type
	userPrefs.values.media_listing_type = type;
	if (!skipCookie) {
	    if (BBXFunctions.isCookiesEnabled()) {
		BBXFunctions.addToCookie({'name': 'userPrefs', values: userPrefs});
	    } else {
	    }
	}
	
	switch(type) {
	case 'grid':
	    $(target).html(_.template(MediaGridTpl, data));

	    // carrega galeria (fancybox)
	    $('head').append('<link rel="stylesheet" href="/css/jquery.fancybox.css" type="text/css" />');
	    $('head').append('<link rel="stylesheet" href="/css/jquery.fancybox-buttons.css" type="text/css" />');
	    
	    BBX.tmp.fancybutton = {};
	    $('.fancybox-button').fancybox({
		autoHeight: true,
		autoWidth: true,
		prevEffect: 'none',
		nextEffect: 'none',
		openEffect: 'none',
		closeEffect: 'none',
		padding: 0,
		closeBtn: false,
		helpers: {
		    title: { type : 'inside' },
		    buttons: {}
		},
		// TODO: autoplay quando termina o video
		afterLoad: function() {
		    if (this.type === 'iframe') {
			BBX.tmp.fancybutton.minHeight = this.minHeight;
			this.minHeight = '450px';

			$('iframe').contents().find('video').bind('ended', function() {
			    $.fancybox.next();
			});
		    } else if (this.type === 'image') {
			this.minHeight = BBX.tmp.fancybutton.minHeight;
		    }
		}
	    });
	    
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
	    $('thead td.status a').on('click', function(){ mediaSearchSort('is_local,is_requested', true)});
	    
	    var default_columns = {
		'name': 'active_columns',
		'values' : {
		    'name': true, 'author': true, 'format': true, 'origin': true, 'date': true, 'license': true, 'type': true, 'num_copies': true, 'is_local': true, 'status': true, 'note': false, 'tags': false
		}
	    },
		active_columns = {};

	    // se estiver definido no cookie, pega valor dele; senão pega default
	    if (typeof userPrefs.values['active_columns'] !== 'undefined') {
		active_columns = {
		    'name': 'active_columns',
		    'values': userPrefs.values['active_columns']
		}
	    } else {
		active_columns = default_columns;
	    }
	    var toggle_columns = function(column_name) {
		var el_name = '.' + column_name + ' input',
		    checked = $(el_name).prop('checked');
		
		// pega sempre o novo estado (o que acabou acabou de clicar)
		if (checked === true) {
		    // adiciona a lista
		    active_columns.values[column_name] = true;
		    // mostra colunas
		    $('td.' + column_name).show();
		    $('th.' + column_name).show();
		} else {
		    // remove da lista
		    active_columns.values[column_name] = false;
		    // esconde colunas
		    $('td.' + column_name).hide();
		    $('th.' + column_name).hide();
		}

		userPrefs = setUserPrefs(userPrefs, active_columns);
		if (BBXFunctions.isCookiesEnabled()) {
		    BBXFunctions.addToCookie({'name': 'userPrefs', values: userPrefs});
		}
	    }
	    
	    $('#menu-colunas input:checkbox').each(function() {
		if (active_columns.values[this.name] === true) {
		    $(this).prop('checked', 'checked');
		} else {
		    $('td.' + this.name).hide();
		    $('th.' + this.name).hide();
		}
		$(this).bind('click', function() {
		    toggle_columns($(this).prop('name'));
		});
	    });
	    
	    
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

    /**
     * Dá saída da paginação de busca
     *
     * @param {String} url String URL da busca para chamada de API
     * @param {Integer} limit Integer com limit
     * @param {Integer} offset Integer com offset
     */
    var parsePagination = function(url, limit, offset) {
	var limit = limit || 1,
	    offset = offset || 20,
	    config = __getConfig(),
	    urlApi = url.split('/limit')[0] + '/count' || url + '/count',
	    urlInterface = Backbone.history.location.href.split('/limit')[0],
	    pagination = {
		'totalMedia': null,
		'itensPerPage': 20,
		'limit': limit,
		'offset': offset,
		'totalPages': null,
		'url': urlInterface
	    },
	    media = new MediaModel([], {url: urlApi});
	media.fetch({
	    success: function() {
		pagination.totalMedia = media.attributes.count;
		pagination.totalPages = Math.ceil(pagination.totalMedia / pagination.itensPerPage);
		BBX.mediaPagination = pagination;
		$('#pagination-top').html(_.template(MediaPaginationTpl, BBX.mediaPagination));
		$('#pagination-bottom').html(_.template(MediaPaginationTpl, BBX.mediaPagination));
	    }
	});		    
    }

    /**
     * Retorna tipos de mídia aceitos
     *
     * @returns {Object} Objeto de tipos de arquivos aceitos
     */    
    var getMediaTypes = function() {
	return {
	    'audio': 'audio',
	    'imagem': 'imagem',
	    'video': 'video',
	    'arquivo': 'arquivo'
	}
    };

    /**
     * Retorna tipos mime validos
     *
     * @returns {Object} Tipos mime validos
     */    
    var getValidMimeTypes = function() {
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
	}

	return valid_mimetypes;
    }

    /**
     * Retorna tipos por mime
     *
     * @param {String} mimetype Mimetype
     * @returns {Bool} Booleano se o valor é válido ou não
     */        
    var getTypeByMime = function(mimetype) {
	var valid_mimetypes = getValidMimeTypes(),
	    type = null;

	// se o arquivo não estiver listado nos mime type válidos, retorna false
	if (valid_mimetypes.hasOwnProperty(mimetype)) {
	    return valid_mimetypes[mimetype];
	} else {
	    return false;
	}
    };
    
    /**
     * Retorna tipos de licenças de mídia
     *
     * @returns {Object} Objeto com todas as licenças aceitas
     */
    var getMediaLicenses = function() {
	// TODO: buscar licenças da API
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

    /**
     * Busca mídias, genérico
     * 
     * @param {String} url Url API
     * @param {function} callback Função de callback
     * @param {Object} params Parâmetros gerais
     * @returns {None} [conteúdo setado pelo jQuery]
     */
    var getMedia = function(url, callback, params) {
	var params = params || {},
	    media = new MediaModel([], {url: url}),
	    limit = url.match('limit'),
	    offset = null,
	    pagination = null;
	
	// TODO: #122 - move to a separated function
	// extract limit and offset
	if (limit) {
	    limit = url.split('limit/');
	    if (typeof limit[1] !== 'undefined') {
		limit = limit[1];
		offset = limit.split('/');
		if (typeof offset[1] !== 'undefined') {
		    limit = parseInt(offset[0]);
		    offset = parseInt(offset[1]);
		} else {
		    limit = parseInt(limit);
		    offset = null;
		}
	    }
	}
		
	$('#content').append('<div class="loading-content"><img src="images/buscando.gif" /></div>');
	media.fetch({
	    success: function() {
		var mediaData = {},
		    medias = {};
		
		// parse pagination only at search pages
		if (url.match('/search')) {
		    parsePagination(url, limit, offset);
		}
		
		$('#content .loading-content').remove();
		mediaData = {
		    formatDate: function(date) {
			var newDate = '',
			    re = /^(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)[\.0-9]*Z$/,
			    matches = date.match(re);
			
			return matches[3] + '/' + matches[2] + '/' + matches[1];
		    }
		};
		
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
		if (typeof callback === 'function') {
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

    /**
     * Dá saída de thumbnails
     *
     * @param {Object} media Objeto mídia
     * @param {Object} params Parâmetros (altura, largura)
     * @returns {None} [Saída dada pelo jquery]
     */
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
			$('#media-' + media.uuid).prop('src', media.url)
			
		    } else {
			$('.media-image-container').prepend('<img id="media-' + media.uuid + '" src="' + media.url + '" />');
		    }
		    var width = (params.width !== '00' && params.width < tmpImage.naturalWidth) ? params.width : tmpImage.naturalWidth;
		    var height = (params.height !== '00' && params.height < tmpImage.naturalHeight) ? params.height : tmpImage.naturalHeight;
  		    $('#media-' + media.uuid).prop('width', width);
		    $('#media-' + media.uuid).prop('height', height);
		}
	    }
	});
    }

    /**
     * Função para equalizar histograma para lista de tags * NAO FUNCIONA AINDA *
     * 
     * @param {Object} data Objeto com lista de tags e tag_count
     * @returns {Object} Objeto com lista equalizada de tags
     */
    var equalizeTags = function(data) {
	var start = new Date().getTime();
	
	var equalizedData = _.sortBy(_.values(data.tags), 'tag_count');
	    minValue = _.first(equalizedData).tag_count;
	    maxValue = _.last(equalizedData).tag_count;
	amplitude = _.parseInt((maxValue + minValue) / 2);
	totalClasses = null;
	maxClasses = 10;
	intervaloMedio =  null;
	okClasses = [];
	    somaTagCount = 0;

	var listaContagem = [];

	// listaContagem[numero_de_medias_com_a_tag] = numero_tags;
	// listaContagem["1 ocorrencia"] = 20	
	_.each(equalizedData, function(tag) {
	    var ocorrencias = tag.tag_count;
	    console.log('ocorrencia: ' + ocorrencias);
	    
	    if (typeof listaContagem[ocorrencias] === 'undefined') {
		console.log('cria: '+ ocorrencias);
		// cria novo registro
		listaContagem.push(ocorrencias);
		listaContagem[ocorrencias] = 1;
	    } else {
		listaContagem[ocorrencias] = listaContagem[ocorrencias] + 1;
		console.log('adicionou');
		console.log(listaContagem[ocorrencias]);
	    }
	    console.log(listaContagem);
	    
	});
	//listaContagem = _.sortBy(listaContagem);
	totalClasses = Object.keys(listaContagem).length;
	intervaloMedio = (minValue + maxValue) / totalClasses;
	
	//console.log(equalizedData);	
	console.log(minValue);
	console.log(maxValue);
	console.log(totalClasses);
	console.log(listaContagem);
	console.log(somaTagCount);
	
	// tem que fazer duas coisas:
	// diminuir o número de classes ao máximo
	// diminuir os valores de cada classe a um número equalizado
	
	// primeiro caso:
	// número de classes menor que máximo de classes
	// normalizar maiores classes às menores
	if (totalClasses <= totalClasses) {
	    for (c = 1; c <= maxClasses; c++) {
		var tmpTag = listaContagem[c];
		
		// se for menor, que c * intervaloMedioo
		if (tmpTag <= c*intervaloMedio) {
		    console.log(intervaloMedio);
		    /*
		    console.log('-----------');
		    console.log(tmpTag);
		    console.log('c: ' + c);
		    console.log(c*intervaloMedio);
		    */
		    okClasses.push(tmpTag);
		} else {
		    okClasses.push(c*intervaloMedio);
		}
	    }
	} else if (totalClasses > maxClasses) {
	    // precisa diminuir o número de classes
	    //for (var c = 1; c < maxClasses; c++) {
		
	    //}	    
	}
	console.log(okClasses);
	var end = new Date().getTime();
	var time = end - start;
	console.log('Execution time: ' + time + 'ms');
	
	return data;
    }
    
    /**
     * Retorna nuvem de tags de uma mucua dada
     * 
     * @param {String} mucua Nome da Mucua 
     * @param {String} el Elemento HTML
     * @returns {None} [conteúdo definido pelo jQuery]
     */
    var getTagCloudByMucua = function(mucua, el) {
	console.log('tagcloud bymucua');
	var url = BBX.config.apiUrl + '/' + BBX.config.repository + '/' + mucua + '/tags';
	
	__getTagCloud(el, url);
    }

    /**
     * retorna nuvem de tags a partir de uma busca
     * 
     * @param {String} el Elemento HTML alvo
     * @returns {None} [conteúdo definido pelo jQuery]
     */
    var getTagCloudBySearch = function(el) {
	console.log('tagcloud bysearch');
	var tags = __getTagsFromUrl(),
	    url = BBX.config.apiUrl + '/' + BBX.config.repository + '/' + BBX.config.mucua + '/tags/' + tags;

	__getTagCloud(el, url);
    }

    /**
     * função genérica de buscar tags que recebe callbacks
     *
     * @el {String} el Elemento HTML
     * @url {String} url Endereço da consulta à API
     * @callback {Function} callback Função opcional a ser executada
     * @returns {None}
     */
    var __getTagCloud = function(el, url, callback) {
	var callback = callback || null,
	    tag = new TagModel([], {url: url});
	    
	tag.fetch({
	    success: function() {
		var maxTags = 40,
		    tags = tag.attributes,
		    data = {};

		tagData = tags;
		// ordena por qtd ocorrencias
		tags =_.sortBy(_.sortBy(tagData, 'tag_count').reverse().slice(0,maxTags), 'name');
		
		data = {
		    tags: tags
		}		
		
		//data = equalizeTags(data);
		
		$(el).html(_.template(TagCloudTpl, data));		
		__parseTagCloud(el)
				
		if (typeof callback === 'function') {
		    callback(true);
		}
	    }
	});	
    }
    
    /**
     * retorna nuvem de tags e ativa biblioteca tagcloud
     * 
     * @param {String} el Elemento HTML alvo
     * @returns {None} [conteúdo definido pelo jQuery]
     */
    var __parseTagCloud = function(el) {	  
	$.fn.tagcloud.defaults = {
	    size: {start: 10, end: 16, unit: 'pt'},
	    color: {start: '#88A7B5', end: '#145B7A'}
	};
	
	$(function () {
	    $(el + ' a').tagcloud();
	});
	   
    }

    /**
     * busca mídias passando limite
     * 
     * @param {String} el Elemento HTML alvo
     * @param {Integer} limit Limite da busca
     * @returns {None} [conteúdo definido pelo jQuery]
     */
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
	    
	    BBX.data = data;
	    showMediaBy('grid', '#destaques-mucua .media');
	}, {'width': 190, 'height': 132 });
    };

    /**
     * busca mídias por mucua com limite
     * 
     * @param {String} el Elemento HTML alvo
     * @param {Integer} limit Limite da busca
     * @returns {None} [conteúdo definido pelo jQuery]
     */    
    var getMediaByMucua = function(el, limit) {
	var config = __getConfig(),
	    defaultLimit = 4,
	    limit = limit || defaultLimit,
	    url = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/bbx/search/limit/' + limit ;
	
	getMedia(url, function(data){
	    __parseMenuSearch();
	    $(el).append(_.template(MediaDestaquesMucuaTpl));
	    data.message = 'Nenhuma media na mucua ' + config.mucua + ' encontrada.';
	    
	    BBX.data = data;
	    showMediaBy('grid', '#destaques-mucua .media', true);
	}, {'width': 190, 'height': 132 });
    };

    /**
     * busca últimas mídias adicionadas, com limite
     * 
     * @param {String} el Elemento HTML alvo
     * @param {Integer} limit Limite da busca
     * @returns {None} [conteúdo definido pelo jQuery]
     */
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
	    BBX.data = data;
	    showMediaBy('grid', '#novidades-mucua .media', true);
	    //$('.media-display-type .grid').on('click', function(){ showMediaBy('grid')});	    
	    //$('.media-display-type .list').on('click', function(){ showMediaBy('list')});	    
	}, {'width': 190, 'height': 132 });
    };

    /**
     * busca mídias relacionadas, com limite
     * 
     * @param {String} uuid UUID da mídia
     * @param {Integer} limit Limite da busca
     * @returns {None} [conteúdo definido pelo jQuery]
     */
    var getMediaRelated = function(uuid, limit) {
	var config = __getConfig(),
	    limit = limit || defaultLimit,
	    url = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/media/' + uuid + '/related' + '/' + limit;
	
	getMedia(url, function(data){
	    $('#content').append(_.template(MediaRelatedTpl));
	    data.message = 'Nenhuma media relacionada encontrada.';

	    BBX.data = data;
	    showMediaBy('', '#media-related .media');
	    $('.media-display-type .grid').on('click', function(){ showByGrid()});	    
	    $('.media-display-type .list').on('click', function(){ showByList()});	    
	});
    };

    /**
     * busca mídias por mocambola, com limite
     * 
     * @param {String} origin mucua de origem
     * @param {String} username usuário
     * @param {Integer} limit Limite da busca
     * @return {None} [conteúdo definido pelo jQuery]
     */
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
	    // TODO: implementar busca filtrando por mocambola
	    __parseMenuSearch();
	    $('#content').append(_.template(MediaMocambolaTpl));
	    data.message = 'Mocambola ainda nao publicou nenhum conteudo.';
	    
	    BBX.data = data;
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

    /**
     * busca galeria de mídia, com limite
     * 
     * @param {String} url URL da API
     * @param {Integer} limit Limite da busca
     * @returns {None} [conteúdo definido pelo jQuery]
     */
    // TODO: alterar funcao para contemplar VIEW e EDIT (atualmente só VIEW)
    var getMediaGallery= function(url, limit) {
	var limit = limit || '';
	
	if (limit !== '') {
	    url += '/limit/' + limit;
	}
	
	getMedia(url, function(data) {
	    __parseMenuSearch();	    
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
		config = BBX.config,	    
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

	    // TODO: passar para user preferences
	    
	    
	    var active_columns = ['thumb', 'name', 'date', 'license', 'tags'],
		toggle_columns = function(column_name) {
		    var el_name = '.' + column_name + ' input',
			checked = $(el_name).prop('checked');
		    // pega sempre o novo estado (o que acabou acabou de clicar)
		    if (checked === true) {
			$('td.all-' + column_name).show();
			$('td.' + column_name).show();
			$('th.' + column_name).show();
		    } else {
			$('td.all-' + column_name).show();
			$('td.' + column_name).hide();
			$('th.' + column_name).hide();
		    }
		}

	    $('#menu-colunas input:checkbox').each(function() {
		if (_.contains(active_columns, this.name)) {
		    $(this).prop('checked', 'checked');
		} else {
		    $('td.all-' + this.name).hide();
		    $('td.' + this.name).hide();
		    $('th.' + this.name).hide();
		}
		
		$(this).bind('click', function() {
		    toggle_columns($(this).prop('name'));
		});
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
		var uuidObjects = $('.uuid'),
		    mediaData = {};
		
		_.each(uuidObjects, function(uuid) {
		    uuid = uuid.value;
		    mediaData = __getFormData(uuid);
		    
		    __updateMedia(mediaData, function(ok) {
			var elem = '#uuid-' + uuid;
			if (ok) {
			    $(elem).css('background-image', 'url(../images/saved-pq.png)');
			} else {
			    $(elem).css('background-image', 'url(../images/error.png)');
			    $(elem).append( MediaUpdateErrorMessageTpl);
			    setTimeout(function(){
				$(elem + ' div').fadeOut(1000)
			    }, 2000);     
			}
		    });
		});
	    });		

	    $('.save-media-item').click(function(el) {
		console.log('save item');
		var uuid = el.currentTarget.id.replace('uuid-', ''),
		    mediaData = __getFormData(uuid);
		
		mediaData.uuid = uuid;
		
		__updateMedia(mediaData, function(ok) {
		    var elem = '#uuid-' + uuid;
		    if (ok) {
			$(elem).css('background-image', 'url(../images/saved-pq.png)');
		    } else {
			$(elem).css('background-image', 'url(../images/error.png)');
			$(elem).append( MediaUpdateErrorMessageTpl);
			setTimeout(function(){
			    $(elem).css('background-image', 'url(../images/save.png)');
			    $(elem + ' div').fadeOut(1000)
			}, 2000);     
		    }
		});
	    });
	    
	}, {'width': 130, 'height': 90 });	    
    };
    
    /**
     * atualiza mídia
     * 
     * @param {Object} mediaData Objeto com elementos de formulário do mídia
     * @param {function} callback Função de execução
     * @returns {None} [conteúdo definido pelo jQuery]
     */    
    var __updateMedia = function(mediaData, callback) {
	var callback = callback || false,
	    media = null,
	    options = {},	
	    config = BBX.config,
	    urlUpdateItem = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/media/' + mediaData.uuid;    
	
	media = new MediaModel([mediaData], {url: urlUpdateItem});
	options.beforeSend = function(xhr){
	    // requiores cookies
	    xhr.setRequestHeader('X-CSRFToken', $.cookie('csrftoken'));
	}
	console.log('updating media ' + mediaData.uuid);
	
	//HACK para passar o objeto corretamente
	media.attributes =  _.clone(media.attributes[0]);
	Backbone.sync('update', media, options)
	    .done(function(){
		if (typeof callback === 'function') {
		    callback(true);
		};
	    })
	    .error(function(){
		if (typeof callback === 'function') {
		    callback(false);
		};
	    });
    }

    /**
     * retorna busca
     * 
     * @param {String} url URL da API
     * @param {Integer} limit Limite
     * @returns {None} [conteúdo definido pelo jQuery]
     */    
    var getMediaSearch = function(url, limit) {
	var limit = limit || '';
	if (limit !== '') {
	    url += '/limit/' + limit;
	}
	
	getMedia(url, function(data) {
	    var resultCount,
		messageString = "",
		terms = {},
		config = BBX.config;
	    
	    __parseMenuSearch();
	    
	    // parse result message
	    if (!_.isEmpty(data.medias)) {
		resultCount = _.size(data.medias);
		messageString = (resultCount == 1) ? resultCount + ' resultado' : resultCount + ' resultados';
	    } else {
		messageString = "Nenhum resultado";
	    }	    
	    
	    $('#imagem-busca').prop('src', config.imagePath + '/buscar.png');
	    $('#content').html(_.template(MediaResultsTpl));
	    data.message = 'Nenhuma media encontrada para essa busca';
	    
	    BBX.data = data;
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
       
    /** 
     * altera limite de mídia
     *
     * @param {Integer} limit limite da query
     * @param {String} urlApi string opcional para passar como urlApi; por padrão é 'bbx/search'
     * @returns {None} altera url do navegador
     */
    var changeMediaLimit = function(limit, urlApi) {
	var url = Backbone.history.location.href,
	    urlApi = urlApi || BBX.config.apiUrl + '/' + BBX.config.repository + '/' + BBX.config.mucua + '/bbx/search/';
	
	console.log('change media limit');
	if (url.match('limit')) {
	    url = url.split('/limit')[0];
	} else {
	    url += '/limit/1000';
	}
	window.location.replace(url);
    }

    /** 
     * requisitar cópia
     *
     * @param {String} uuid UUID do conteúdo solicitado
     * @returns {None} [conteúdo definido pelo jQuery]
     */
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
    
    /**
     * ativa botão de requisição
     *
     * @param {String} uuid UUID do conteúdo atual
     * @returns {None} [conteúdo definido pelo jQuery]
     */
    var bindRequest = function(uuid) {
	$('.request-copy').on('click', function() { requestCopy(uuid) });   
    }

    /** 
     * altera ordenamento dos conteúdos
     *
     * @param {String} field Nome do campo
     * @param {Bool} multiple Booleano, se for mais de um campo
     * @returns {None} [conteúdo definido pelo jQuery]
     */    
    var mediaSearchSort = function(field, multiple) {
	var multiple = multiple || false,
	    url = Backbone.history.location.href,
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
	
	__check_ordering = function(url, multiple) {
	    var multiple = multiple || false;

	    if (!multiple) {
		if (url.match('/asc')) {
		    return '/desc';
		} else if (url.match('/desc')) {
		    return '/asc';
		} else {
		    return '/asc';
		}
	    } else {
		if (url.indexOf('/asc') !== url.lastIndexOf('/asc') && url.indexOf('/asc') !== -1) {
		    return '/desc';
		} else if (url.indexOf('/desc') !== url.lastIndexOf('/desc') && url.indexOf('/desc') !== -1) {
		    return '/asc';
		} else {
		    return '/asc';
		}
	    } 
	}
	
	if (multiple) {
	    field = field.split(',');
	    if (field.length <= 1) {
		multiple = false;
	    }
	}
	
	// bbx/search/quiabo/orderby/is_local/limit/100
	if (url.match('/orderby/') && url.match('/limit/')) {
	    console.log('order && limit');
	    reUrl = 'orderby\/(.*)\/limit';
	    matches = url.match(reUrl);
	    old_field = matches[1];
	    
	    if (!multiple) {
		ordering_type = (old_field == field + ordering_type) ? __check_ordering(url) : ordering_type;
		url = url.replace(old_field, field + ordering_type);
	    } else {
		ordering_type = (field[0] + ordering_type + '/' + field[1] + ordering_type) ? __check_ordering(url, true) : ordering_type;
		url = url.replace(old_field, field[0] + ordering_type + '/' + field[1] + ordering_type);
	    }
	    
        // bbx/search/quiabo/orderby/is_local
	} else if (url.match('/orderby/') && !url.match('/limit/')) {
	    console.log('order');
	    reUrl = 'orderby\/(.*)$';
	    matches = url.match(reUrl);
	    old_field = matches[1];

	    if (!multiple) {
		ordering_type = (old_field == field + ordering_type) ? __check_ordering(url) : ordering_type;
		url = url.replace(old_field, field + ordering_type);
	    } else {
		ordering_type = (field[0] + ordering_type + '/' + field[1] + ordering_type) ? __check_ordering(url, true) : ordering_type;
		url = url.replace(old_field, field[0] + ordering_type + '/' + field[1] + ordering_type);
	    }
	    	    
	// bbx/search/quiabo/limit/100
	} else if (url.match('/limit/')) {
	    console.log('limit');
	    reUrl = '(.*)\/limit\/(.*)';
	    matches = url.match(reUrl);

	    if (!multiple) {
		ordering_type = __check_ordering(url);
		url = matches[1] + '/orderby/' + field + ordering_type + '/limit/' + matches[2];
	    } else {
		ordering_type = __check_ordering(url, true);
		url = matches[1] + '/orderby/' + field[0] + ordering_type + '/' + field[1] + ordering_type + '/limit/' + matches[2];
	    }
	    
	    
	// bbx/search
	} else {
	    if (!multiple) {
		ordering_type = __check_ordering(url);
		url += '/orderby/' + field + ordering_type;
	    } else {
		ordering_type = __check_ordering(url, true);
		url += '/orderby/' + field[0] + ordering_type + '/' + field[1] + ordering_type;
	    }
	}
	
	window.location.replace(url);
    }

    // funções públicas são definidas abaixo
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
	getValidMimeTypes: getValidMimeTypes,
	getTypeByMime: getTypeByMime,
	bindRequest: bindRequest,
	requestCopy: requestCopy,
	mediaSearchSort: mediaSearchSort,
	getTagCloudBySearch: getTagCloudBySearch,
	getTagCloudByMucua: getTagCloudByMucua,
	__getTagsFromUrl: __getTagsFromUrl,
	__parseMenuSearch: __parseMenuSearch,
	parseThumb: parseThumb,
	parsePagination: parsePagination
    }
});
