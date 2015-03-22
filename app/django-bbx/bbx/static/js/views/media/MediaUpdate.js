define([
    'jquery', 
    'lodash',
    'jquery_cookie',
    'jquery_form',
    'backbone',
    'textext',
    'textext_ajax',
    'textext_autocomplete',
    'modules/bbx/functions',
    'modules/media/functions',
    'modules/media/model',
    'text!/templates/' + BBX.userLang + '/media/MediaPublish.html',
    'text!/templates/' + BBX.userLang + '/media/MediaConfirmRemoveMessage.html',
    'text!/templates/' + BBX.userLang + '/media/MediaRemoveMessage.html',
], function($, _, jQueryCookie, jQueryForm, Backbone, Textext, TextextAjax, TextextAutocomplete, BBXFunctions, MediaFunctions, MediaModel, MediaPublishTpl, MediaConfirmRemoveMessageTpl, MediaRemoveMessageTpl){
    var MediaUpdate = Backbone.View.extend({
	
	__getFormData: function() {
	    var media = BBX.media,
	    fields = {};
	    
	    $('#form_media_publish :input').each(function() {
		fields[this.name] = this.value;
	    });
	    // TODO: adicionar tags separadas (patrimonio, publico) a tags
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
		media_file: $('#mediafile-original').html()
	    }
	    // HaCK para pegar tags no formato correto
	    media.tags = media.tags.substring(1, media.tags.length -1).replace(/\"/g,'');
	    
	    return media;
	},

	__swapLicence: function() {
	    $('#license option:selected').each(function() {
		l = $(this);
		if (!_.isEmpty(l.val())) {
		    var license = 'license-' + l.val();
		    $('#license_image').prop('class', license);
		}
	    });		
	},

	__updateMedia: function() {
	    var config = BBX.config,   
	    mediaData = getFormData(),
	    media = null,
	    options = {},
	    urlUpdate = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/media/' + mediaData.uuid;
	    media = new MediaModel([mediaData], {url: urlUpdate});
	    options.beforeSend = function(xhr){
		xhr.setRequestHeader('X-CSRFToken', $.cookie('csrftoken'));
	    };
	    //HACK para passar o objeto corretamente
	    media.attributes =  _.clone(media.attributes[0]);
	    console.log(media.attributes);

	    Backbone.sync('update', media, options).done(function(){
		$('#media-update-image').prop('src', 'images/saved.png');
	    });
	},
	
	render: function(uuid){
	    getFormData = this.__getFormData;
	    swapLicense = this.__swapLicense;
	    updateMedia = this.__updateMedia;
	    
	    // comeca acao da funcao render
	    var config = BBX.config,   
	    urlApi = config.apiUrl + '/' + config.repository + '/' +  config.mucua + '/media/' + uuid,
	    urlMediaView = config.interfaceUrl + config.repository + '/' +  config.mucua + '/media/' + uuid;
	    BBXFunctions.renderSidebar();
	    
	    var media = new MediaModel([], {url: urlApi});
	    media.fetch({
		success: function() {
		    // TODO: passar caminho da imagem preview
		    media.image_preview = '';		    
		    var data = {
			media: media.attributes,
			urlMediaView: urlMediaView,
			types: MediaFunctions.getMediaTypes(),
			licenses: MediaFunctions.getMediaLicenses(),
			page: 'MediaUpdate',
			pageTitle: 'Editar conteúdo'
		    }
		    BBX.media = media;
		    var compiledTpl = _.template(MediaPublishTpl, data);
		    
		    $('#content').html(compiledTpl);  
		    $('#origin').append("<option value='" + media.attributes.origin + "'>" + media.attributes.origin + "</option>");
		    $('#origin').prop('disabled', true);
		    
		    var csrftoken = $.cookie('csrftoken');
		    $('#csrfmiddlewaretoken').prop('value', csrftoken);

		    $('head').append('<link rel="stylesheet" href="/css/textext.core.css" type="text/css" />');		    
		    $('head').append('<link rel="stylesheet" href="/css/textext.plugin.autocomplete.css" type="text/css" />');		    
		    var urlApiTags = Backbone.history.location.origin + config.apiUrl + '/' + config.MYREPOSITORY + '/' + config.MYMUCUA + '/tags/search/';
		    var tags_arr = media.attributes.tags,
			tags_str = tags_arr.join('/');
		    $('#tags').textext({
			plugins : 'tags autocomplete ajax',
			tagsItems: tags_arr,
			ajax : {
			    url : urlApiTags,
			    dataType : 'json'
			},
		    })
		    
		    // eventos		  
		    $('#license').on('change', swapLicense);
		    
		    $('#submit').on('click', function() { updateMedia(); });
		    $('#view-media').on('click', function() { 
			window.location.href = urlMediaView;
		    });
		    $('#delete-media').on('click', function() {
			var deleteMedia = confirm(MediaConfirmRemoveMessageTpl);
			if (deleteMedia) {
			    var urlDelete = config.apiUrl + '/' + config.repository + '/' +  config.mucua + '/media/' + uuid + '/remove',
				mediaDelete = new MediaModel([], {url: urlDelete}),
				urlRedirect = config.interfaceUrl + config.repository + '/' +  config.mucua + '/bbx/search';
			    
			    mediaDelete.fetch({
				success: function() {
				    $('.buttons').prepend(MediaRemoveMessageTpl);
				    setTimeout(function(){
					window.location.href = urlRedirect;
				    }, 2000);
				}
			    });
			}	
		    });
		    
		}
	    });
	},
    });

    return MediaUpdate;
});
