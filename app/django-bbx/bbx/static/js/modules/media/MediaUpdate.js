define([
    'jquery', 
    'underscore',
    'jquery_cookie',
    'jquery_form',
    'backbone', 
    'modules/bbx/base-functions',
    'modules/media/model',
    'text!templates/media/MediaEditForm.html'
], function($, _, jQueryCookie, jQueryForm, Backbone, BBXBaseFunctions, MediaModel, MediaEditFormTpl){
    var MediaUpdate = Backbone.View.extend({
	
	render: function(uuid){
	    getFormData = function() {
		data = $('body').data('data').data;
		
		fields = {};
		$('#form_media_publish :input').each(function() {
		    fields[this.name] = this.value;
		});
		mediafile = $('#mediafile-original').html();
		
		// TODO: adicionar tags separadas (patrimonio, publico) a tags
		media = {
		    name: fields.name,
		    origin: fields.origin,
		    author: fields.author,
		    repository: fields.repository,
		    tags: fields.tags,
		    license: fields.license,
		    date: fields.date,
		    type: fields.type,
		    note: fields.note,		
		    mediafile: mediafile,
		}
		data.media = media;
		return data;
	    }
	    
	    swap_license = function() {
		$('#license option:selected').each(function() {
		    l = $(this);
		    if (!_.isEmpty(l.val())) {
			license = 'license-' + l.val();
			console.log(license);
			$('#license_image').attr('class', license);
		    }
		});		
	    }
	    
	    update_media = function() {
		data = getFormData();
		var media = new MediaModel([data.media], {url: data.urlApi});
		options = {}
		options.beforeSend = function(xhr){
		    xhr.setRequestHeader('X-CSRFToken', $.cookie('csrftoken'));
		};
		//HACK para passar o objeto corretamente
		media.attributes =  _.clone(media.attributes[0]);
		Backbone.sync('update', media, options);		
	    }
	    
	    repository = $('body').data('data').repository;
	    mucua = $('body').data('data').mucua;
	    baseurl = '#' + repository + '/' + mucua;
	    urlApi = $('body').data('data').config.apiUrl + '/' + repository + '/' +  mucua + '/media/' + uuid;
	    urlMediaView = $('body').data('data').config.interfaceUrl + repository + '/' +  mucua + '/media/' + uuid;
	    
	    // TODO: pegar licenças da API ou outra forma
	    var licenses = {
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
	    
	    var media = new MediaModel([], {url: urlApi});
	    media.fetch({
		success: function() {
		    // TODO: passar caminho da imagem preview
		    media.image_preview = '';		    
		    var data = {
			media: media,
			baseurl: baseurl,
			urlApi: urlApi,
			urlMediaView: urlMediaView,
			licenses: licenses,
			page: 'MediaUpdate',
		    }
		    
		    var compiledTpl = _.template(MediaEditFormTpl, data);
		    $('#content').html(compiledTpl);  

		    $('body').data('data').data = data;
		    
		    var csrftoken = $.cookie('csrftoken');
		    $('#csrfmiddlewaretoken').attr('value', csrftoken);
		    
		    // eventos		  
		    $('#license').on('change', swap_license);

		    $('#submit').on('click', function() { update_media(); });
		    $('#view-media').on('click', function() { 
			window.location.href = urlMediaView;
		    });
		}
	    });
	},
    });

    return MediaUpdate;
});