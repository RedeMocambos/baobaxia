define([
    'jquery', 
    'lodash',
    'jquery_form',
    'backbone',
    'fileupload',
    'textext',
    'textext_ajax',
    'textext_autocomplete',
    'modules/bbx/functions',
    'modules/media/functions',
    'modules/media/model',
    'modules/mucua/model',
    'modules/mucua/collection'
], function($, _, JQueryForm, Backbone, FileUpload, Textext, TextextAjax, TextextAutocomplete, BBXFunctions, MediaFunctions, MediaModel, MucuaModel, MucuaCollection){
    
    var MediaGalleryCreate = Backbone.View.extend({	
	render: function(){
	    var data = {},
		config = BBX.config,
		url = config.apiUrl + "/" + config.MYREPOSITORY + "/" + config.MYMUCUA + "/media/",
		mucuas = new MucuaCollection([], {url: config.apiUrl + '/' + config.MYREPOSITORY + '/mucuas'});

	    if (!BBXFunctions.isLogged()) {
		TemplateManager.get('/templates/' + BBX.userLang + '/common/PermissionDenied', function(PermissionDeniedTpl) {
		    $('#content').html(PermissionDeniedTpl);
		});
		setTimeout(function() {
		    document.location.hash = BBXFunctions.getDefaultHome();
		}, 2000);
		return false
	    }
	    
	    BBXFunctions.renderSidebar();
	    BBXFunctions.renderUsage();
	    MediaFunctions.__parseMenuSearch();
	    
	    // get mucuas list
	    mucuas.fetch({
		success: function() {
		    var mucuasLength = mucuas.models.length;
		    BBX.mucuaList = [];
		    
		    for (var m = 0; m < mucuasLength; m++) {
			var mucua = mucuas.models[m].attributes;
			BBX.mucuaList.push(mucua);
			$('#origin').append("<option value='" + mucua.description + "'>" + mucua.description + "</option>");
		    }
		}
	    });

	    var validateUpload = function() {
		var validationError = [],
		    fields = ['#tags', '#origin'];
		
		// verifica lista de campos obrigatórios
		if ($('#fileupload').find('input[name="tags"]').val() === "[]") {
		    validationError.push('#tags');
		}
		// verifica lista de campos obrigatórios
		if ($('#origin').val() === "") {
		    validationError.push('#origin');
		}
		
		_.each(validationError, function(el) {
		    $(el).addClass('field-error');
		});
		
		// remove a borda caso estiver ok
		_.each(_.difference(fields, validationError), function(field) {
		    $(field).removeClass('field-error');
		});
		
		if (validationError.length > 0) {
		    TemplateManager.get('/templates/' + BBX.userLang + '/media/CreateValidationErrorMessage', function(MediaGalleryCreateValidationErrorMessageTpl) {
			$('#messages').html(_.template(MediaGalleryCreateValidationErrorMessageTpl));
			return false;
		    });
		} else {
		    return true;
		}
	    };
	
	    var prepareUpload = function() {
		console.log('prepare upload');
		
		$('#media_file_input').show();

		$('#fileupload').fileupload({
		    dataType: 'json',
		    url: url,
		    beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', 'JWT ' +  sessionStorage.token);
		    },
		    change: function(e, data) {
			var terms = $('#fileupload').find('input[name="tags"]').val();
			terms = terms.substring(1, terms.length -1).replace(/\"/g,'');
			$('#fileupload').find('input[name="tags"]').val(terms);
			$('#messages').append('<img src="../images/loading.gif" /><br/>');
		    },
		    
		    done: function(e, dataResult) {
			var data = {
			    media: {
				uuid: dataResult.result.uuid
			    }
			};

			TemplateManager.get('/templates/' + BBX.userLang + '/media/MediaGalleryCreateMessage', function(MediaGalleryCreateMessageTpl) {
			    $('#messages').append(_.template(MediaGalleryCreateMessageTpl, data));
			    var overallProgress = $('#fileupload').fileupload('progress');
			    if (overallProgress.loaded === overallProgress.total) {
				var terms = $('#fileupload').find('input[name="tags"]').val(),
				    gallery_url = '';
				
				terms = terms.substring(0, terms.length).replace(/\"/g,'');
				terms = terms.replace(/,/g, '/');
				
				gallery_url = config.interfaceUrl + config.MYREPOSITORY + '/' + dataResult.result.origin + '/media/gallery/' + terms + '/edit';
				
				window.location.replace(gallery_url);
			    }
			});
		    },

		    progressall: function (e, data) {
			var progress = parseInt(data.loaded / data.total * 100, 10);
			$('#progress .bar').css(
			    'width',
			    progress + '%'
			);
		    },
		    
		    error: function(jqXHR, textStatus, errorThrown) {
			var data = {
			    errorMessage: textStatus,
			    errorThrown: errorThrown
			};
			$('#messages').remove('img')[0];
			
			TemplateManager.get('/templates/' + BBX.userLang + '/media/MediaGalleryCreateErrorMessage', function(MediaGalleryCreateErrorMessageTpl) {
			    $('#messages').append(_.template(MediaGalleryCreateErrorMessageTpl, data));
			});
		    }
		});
	    }
	    
	    // session user data
	    config.userData = localStorage.userData;
	    
	    // set data
	    data.types = MediaFunctions.getMediaTypes(),
	    data.licenses = MediaFunctions.getMediaLicenses();
	    data.config = config;
	    data.page = 'Create Gallery';
	    data.pageTitle = "Create new Gallery";	    
	    
	    // instantiate model with default values
	    data.media = new MediaModel([]);	    
	    data.media.origin = config.MYMUCUA;
	    data.media.repository = config.MYREPOSITORY;
	    data.media.author = config.userData.username;
	    
	    $('head').append('<link rel="stylesheet" href="/css/textext.plugin.autocomplete.css" type="text/css" />');
	    TemplateManager.get('/templates/' + BBX.userLang + '/media/MediaGalleryCreate', function(MediaGalleryCreateTpl) {	    
		$('#content').html(_.template(MediaGalleryCreateTpl, data));
	    });
	    // tags
	    var urlApiTags = Backbone.history.location.origin + config.apiUrl + '/' + config.MYREPOSITORY + '/' + config.MYMUCUA + '/tags/search/';
	    
	    $('#tags')
	        .textext({
		    plugins : 'autocomplete tags ajax',
		    ajax : {
			url : urlApiTags,
			dataType : 'json'
		    }
		})
	    // on select type of file, prepare upload
	    prepareUpload();
	    
	    $('#media_file').on('click', function(e) {
		var validate = validateUpload();
		if (!validate) {
		    e.preventDefault();
		} else {
		    // com validacao ok, limpa mensagens
		    $('#messages').html();
		}
	    });
	}
    });
    
    return MediaGalleryCreate;
});
    
