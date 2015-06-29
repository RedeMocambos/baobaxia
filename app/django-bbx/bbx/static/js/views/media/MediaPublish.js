define([
    'jquery', 
    'lodash',
    'jquery_form',
    'backbone', 
    'modules/bbx/functions',
    'modules/media/functions',
    'modules/media/model',
    'modules/mucua/model',
    'modules/mucua/collection',
    'text!/templates/' + BBX.userLang + '/media/MediaPublish.html',
    'text!/templates/' + BBX.userLang + '/media/MediaPublishInvalidFileType.html'
], function($, _, JQueryForm, Backbone, BBXFunctions, MediaFunctions, MediaModel, MucuaModel, MucuaCollection, MediaPublishTpl, MediaPublishInvalidFileTypeTpl){
    
    var MediaPublish = Backbone.View.extend({	
	render: function(){
	    // var definitions	    
	    var config = BBX.config,
		data = {},
		urlPost = '',
		mediaToken = null,
		mucuas = null;
	    
	    // begin of function definitions
	    var uploadFile = function() {
		var config = BBX.config;
		console.log('upload');
		
		urlPost = config.apiUrl + "/" + config.MYREPOSITORY + "/" + config.MYMUCUA + "/media/";
		$('#form_media_publish').prop('action', urlPost);
		
	    };
	    
	    var updateMedia = function(media) {
		var config = BBX.config,
		    url = config.interfaceUrl + config.repository + "/" + config.mucua + "/media/" + media.uuid + '/edit';
		
		document.location.hash = url;
	    }

	    var __parseOrigin = function(mucuaList) {
		_.each(mucuaList, function(mucua) {
		    $('#origin').append("<option value='" + mucua.description + "'>" + mucua.description + "</option>");
		    
		});
		$('select[name="origin"]').find('option:contains("' + BBX.config.MYMUCUA + '")').prop("selected",true);
	    }
	    
	    var __prepareFormData = function() {
		var data = {},
		    config = BBX.config;
		
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

		return data;
	    }
	    // end of function definitions

	    // begin rendering of MediaPublish
	    
	    // session user data
	    config.userData = localStorage.userData;
	    data = __prepareFormData();
	    
	    $('#content').html(_.template(MediaPublishTpl, data));
	    MediaFunctions.__parseMenuSearch();
	    
	    $('#media_publish .bloco-2').hide();
	    
	    // try to get mucuas list
	    if (typeof BBX.mucuaList === 'undefined') {
		mucuas = new MucuaCollection([], {url: config.apiUrl + '/' + config.MYREPOSITORY + '/mucuas'});
		mucuas.fetch({
		    success: function() {
			var mucuasLength = mucuas.models.length;
			BBX.mucuaList = [];
			for (var m = 0; m < mucuasLength; m++) {
			    var mucua = mucuas.models[m].attributes;
			    BBX.mucuaList.push(mucua);
			}
		    }
		});
	    }
	    
	    var getMucuas = setInterval(function() {
		if (typeof BBX.mucuaList !== 'undefined') {		  
		    __parseOrigin(BBX.mucuaList);
		    
		    clearInterval(getMucuas);
		} 
	    }, 50);
	    
	    
	    // form upload progress meter
	    var bar = $('.bar'),
		percent = $('.percent'),
		status = $('#status');
	    
	    $('#form_media_publish').ajaxForm({
		beforeSend: function(xhr) {
		    xhr.setRequestHeader('Authorization', 'JWT ' +  sessionStorage.token);
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
		    var mediaSerialized = eval('(' + xhr.responseText + ')');
		    updateMedia(mediaSerialized);
		}
	    });
	    
	    $('#submit').on('click', function() {
		if (isValidFileType()) {
		    console.log('valid');
		    $('#form_media_publish').submit();
		} else {
		    console.log('invalid, error message');
		}
	    });

	    // verifica se o tipo de arquivo é valido e retorna true/false
	    var isValidFileType = function() {
		var mime_type = document.getElementById('media_file').files[0].type,  // mime_type do arquivo submetido
		    type = MediaFunctions.getTypeByMime(mime_type), // tipo de arquivo validado por mime type
		    validTypes = MediaFunctions.getMediaTypes(), // tipos validos de arquivos
		    pieces = $('#media_file').val().split('.'), // temporario para separar o formato
		    format = pieces[pieces.length - 1]; // formato do arquivo

		console.log(MediaFunctions.getTypeByMime(mime_type));
		if (MediaFunctions.getTypeByMime(mime_type)) {
		    $("#messages").html("");
		    $('#type').val(type);
		    return true;
		} else {
		    var data = {
			validTypes: MediaFunctions.getValidMimeTypes(),
			format: format
		    }
		    
		    $("#messages").html(_.template(MediaPublishInvalidFileTypeTpl, data));
		    $('#messages .error-bar').fadeIn(0,0, function() {});
		    $('#messages .error-bar').fadeTo(3000, 0, function() {});
		    console.log('abcd');
		    return false;
		}
	    }
	    
	    $('#media_file').on('change', function(el) {
		if (isValidFileType()) {
		    uploadFile();
		} else {
		    $('#messages .error-bar').fadeIn(0,0, function() {});
		    $('#messages .error-bar').fadeTo(3000, 0, function() {});
		    console.log('invalid, error message');
		}
	    });	    
	},
    });
    
    return MediaPublish;
});
