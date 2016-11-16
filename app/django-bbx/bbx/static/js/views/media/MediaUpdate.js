define([
    'jquery', 
    'lodash',
    'jquery_form',
    'backbone',
    'textext',
    'textext_ajax',
    'textext_autocomplete',
    'modules/media/functions',
    'modules/media/model',
], function($, _, jQueryForm, Backbone, Textext, TextextAjax, TextextAutocomplete, MediaFunctions, MediaModel){
    var MediaUpdate = Backbone.View.extend({
	
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
	    mediaData = MediaFunctions.getFormData(),
	    media = null,
	    options = {},
	    urlUpdate = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/media/' + mediaData.uuid;
	    media = new MediaModel([mediaData], {url: urlUpdate});
	    $('#media-update-image').prop('src', 'images/loading-pq.gif');
	    
	    //HACK para passar o objeto corretamente
	    media.attributes =  _.clone(media.attributes[0]);
	    console.log(media.attributes);

	    Backbone.sync('update', media, options).done(function(){
		$('#media-update-image').prop('src', 'images/saved.png');
	    });
	},
	
	render: function(uuid){
	    var getFormData = this.getFormData,
		swapLicense = this.__swapLicense,
		updateMedia = this.__updateMedia;
	    
	    // comeca acao da funcao render
	    var config = BBX.config,   
		urlApi = config.apiUrl + '/' + config.repository + '/' +  config.mucua + '/media/' + uuid,
		urlMediaView = config.interfaceUrl + config.repository + '/' +  config.mucua + '/media/' + uuid,
		params = {'width': 190, 'height': 132 };
	    
	    BBXFunctions.renderSidebar();

	    $('head').append('<link rel="stylesheet" href="/css/textext.core.css" type="text/css" />');		    
	    $('head').append('<link rel="stylesheet" href="/css/textext.plugin.tags.css" type="text/css" />');
	    $('head').append('<link rel="stylesheet" href="/css/textext.plugin.autocomplete.css" type="text/css" />');		    
	    
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
			parseThumb: MediaFunctions.parseThumb,
			params: params,
			page: 'MediaUpdate',
			pageTitle: 'Editar conteúdo'
		    }
		    BBX.media = media;

		    BBXFunctions.getTemplateManager('/templates/' + BBX.userLang + '/media/MediaPublish', function(MediaPublishTpl) {		    
			var compiledTpl = _.template(MediaPublishTpl, data);
			$('#content').html(compiledTpl);

			MediaFunctions.__parseMenuSearch();
			
			$('#origin').append("<option value='" + media.attributes.origin + "'>" + media.attributes.origin + "</option>");
			$('#origin').prop('disabled', true);
			
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
			});
			
			// eventos		  
			$('#license').on('change', swapLicense);
			
			$('#submit').on('click', function() { updateMedia(); });
			$('#view-media').on('click', function() { 
			    window.location.href = urlMediaView;
			});
			$('#delete-media').on('click', function() {
			    BBXFunctions.getTemplateManager('/templates/' + BBX.userLang + '/media/MediaConfirmRemoveMessage', function (MediaConfirmRemoveMessageTpl) {
				var deleteMedia = confirm(MediaConfirmRemoveMessageTpl);
				if (deleteMedia) {
				    var urlDelete = config.apiUrl + '/' + config.repository + '/' +  config.mucua + '/media/' + uuid + '/remove',
					mediaDelete = new MediaModel([], {url: urlDelete}),
					urlRedirect = config.interfaceUrl + config.repository + '/' +  config.mucua + '/bbx/search';
				    
				    mediaDelete.fetch({
					success: function() {
					    BBXFunctions.getTemplateManager('/templates/' + BBX.userLang + '/media/MediaRemoveMessage', function (MediaRemoveMessageTpl) {
						$('.buttons').prepend(MediaRemoveMessageTpl);
						setTimeout(function(){
						    window.location.href = urlRedirect;
						}, 1000);
					    });
					}
				    });
				}
			    });
			});
		    });
		}
	    });
	},
    });

    return MediaUpdate;
});
