define([
    'jquery', 
    'lodash',
    'jquery_form',
    'backbone',
    'fileupload',
    'modules/bbx/functions',
    'modules/media/functions',
    'modules/media/model',
    'modules/mucua/model',
    'modules/mucua/collection',
    'text!/templates/' + BBX.userLang + '/media/MediaGalleryCreate.html',
    'text!/templates/' + BBX.userLang + '/media/MediaGalleryEdit.html',
    'text!/templates/' + BBX.userLang + '/media/MediaGalleryEditItem.html'
], function($, _, JQueryForm, Backbone, FileUpload, BBXFunctions, MediaFunctions, MediaModel, MucuaModel, MucuaCollection, MediaGalleryCreateTpl, MediaGalleryEditTpl, MediaGalleryEditItemTpl){
    
    var MediaGalleryCreate = Backbone.View.extend({	
	render: function(){
	    var data = {},
		config = $("body").data("bbx").config,
		url = config.apiUrl + "/" + config.MYREPOSITORY + "/" + config.MYMUCUA + "/media/",
		urlToken = config.apiUrl + "/" + config.MYREPOSITORY + "/" + config.MYMUCUA + "/media/token",
		mediaToken = new MediaModel([], {url: urlToken}),
		mucuas = new MucuaCollection([], {url: config.apiUrl + '/' + config.MYREPOSITORY + '/mucuas'});

	    BBXFunctions.renderSidebar();
	    BBXFunctions.renderUsage();
	    
	    // get token
	    mediaToken.fetch({
		success: function() {
		    var csrftoken = $.cookie('csrftoken');
		    $('#csrfmiddlewaretoken').attr('value', csrftoken);		    
		}
	    });

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
		    $('select[name="origin"]').find('option:contains("' + BBX.config.MYMUCUA + '")').attr("selected",true);

		    
		}
	    });
	    
	    var prepareUpload = function() {
		console.log('prepare upload');
		
		$('#media_file_input').show();
		$('#fileupload').fileupload({
		    dataType: 'json',
		    url: url,
		    
		    done: function (e, media) {
			$('#messages').append('<span>Media inserted: ' + media.result.uuid + '</span><br/>');
			var overallProgress = $('#fileupload').fileupload('progress');
			console.log(overallProgress);
			if (overallProgress.loaded === overallProgress.total) {
			    var terms = $('#tags').val().replace(',', '/'),
				gallery_url = config.interfaceUrl + config.MYREPOSITORY + '/' + config.mucua + '/media/gallery/' + terms + '/edit';
			    
			    window.location.replace(gallery_url);
			}
		    }
		});
	    }
	    
	    // session user data
	    config.userData = BBXFunctions.getFromCookie('userData');
	    
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
	    
	    $('#content').html(_.template(MediaGalleryCreateTpl, data));
	    
	    // on select type of file, prepare upload
	    $('#media_type').change(function() { prepareUpload() });	    
	}
    });
    
    return MediaGalleryCreate;
});
    
