define([
    'jquery', 
    'lodash',
    'jquery_form',
    'backbone', 
    'modules/bbx/functions',
    'modules/media/functions',
    'modules/media/model',
    'text!/templates/' + BBX.userLang + '/media/MediaPublish.html'
], function($, _, JQueryForm, Backbone, BBXFunctions, MediaFunctions, MediaModel, MediaPublishTpl){
    
    var MediaPublish = Backbone.View.extend({	
	render: function(){
	    var uploadFile = function() {
		var config = $("body").data("bbx").config,
		    // get media token
		    url = config.apiUrl + "/" + config.MYREPOSITORY + "/" + config.MYMUCUA + "/media/",
		    mediaToken = new MediaModel([], {url: url});

		console.log('upload');
		
		mediaToken.fetch({
		    success: function() {
			var csrftoken = $.cookie('csrftoken');
			$('#csrfmiddlewaretoken').attr('value', csrftoken);
		    }
		});
		fields = {};
		$('#form_media_publish :input').each(function() {
		    fields[this.name] = this.value;
		});
		
		// TODO: adicionar tags separadas (patrimonio, publico) a tags
		data = {
		    name: fields['name'].value,
		    uuid: fields['uuid'].value,
		    origin: fields['origin'].value,
		    author: fields['author'].value,
		    repository: fields['repository'].value,
		    tags: fields['tags'].value,
		    license: fields['license'].value,
		    date: fields['date'].value,
		    type: fields['type'].value,
		    note: fields['note'].value,
		    media_file: fields['media_file'].value
		}
		url = config.apiUrl + "/" + config.MYREPOSITORY + "/" + config.MYMUCUA + "/media/";
		$('#form_media_publish').attr('action', url);
		
		var media = new MediaModel([], {url: url});
	    };
	    
	    var updateMedia = function(media) {
		var config = $("body").data("bbx").config,
		    url = config.interfaceUrl + config.repository + "/" + config.mucua + "/media/" + media.uuid + '/edit';
		
		document.location.href = url;
	    }

	    var config = $("body").data("bbx").config,
		data = {},
		url = '',
		mediaToken = null;
	    
	    // session user data
	    config.userData = BBXFunctions.getFromCookie('userData');
	    
	    // set data
	    data.types = MediaFunctions.getMediaTypes(),
	    data.licenses = MediaFunctions.getMediaLicenses();
	    data.config = config;
	    data.page = 'MediaPublish';	    
	    data.pageTitle = 'Adicionar conteúdo';
	    
	    // instantiate model with default values
	    data.media = new MediaModel([]);	    
	    data.media.origin = config.MYMUCUA;
	    data.media.repository = config.MYREPOSITORY;
	    data.media.author = config.userData.username;
	    data.media.date = '';
	    data.media.uuid = '';
	    data.media.name = '';
	    data.media.format = '';
	    data.media.license = '';
	    data.media.media_file = '';
	    data.media.note = '';
	    data.media.tags = [];
	    data.media.type = '';		
	    
	    $('#content').html(_.template(MediaPublishTpl, data));
	    $('#media_publish .bloco-2').hide();
	    
	    // form upload progress meter
	    var bar = $('.bar'),
		percent = $('.percent'),
		status = $('#status');
	    
	    $('#media_file').change(function() {uploadFile()});
	    
	    $('#form_media_publish').ajaxForm({
		beforeSend: function() {
		    status.empty();
		    var percentVal = '0%';
		    bar.width(percentVal)
		    percent.html(percentVal);
		    },
		uploadProgress: function(event, position, total, percentComplete) {
		    var percentVal = percentComplete + '%';
		    bar.width(percentVal)
		    percent.html(percentVal);
		},
		success: function() {
		    var percentVal = '100%';
		    bar.width(percentVal)
		    percent.html(percentVal);
		},
		complete: function(xhr) {
		    status.html(xhr.responseText);
		    console.log(xhr.responseText);
		    mediaSerialized = eval('(' + xhr.responseText + ')');
		    updateMedia(mediaSerialized);
		}
	    });
	    
	    $('#submit').on('click', function() {
		$('#form_media_publish').submit();
	    });
	    $('#media_file').on('change', function(el) {
		var mime = document.getElementById('media_file').files[0].type,
		    type = MediaFunctions.getTypeByMime(mime);
		
		$('#type').val(type);
	    });
	},
    });
    
    return MediaPublish;
});
