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
    'text!/templates/' + BBX.userLang + '/media/MediaGalleryEdit.html',
    'text!/templates/' + BBX.userLang + '/media/MediaGalleryEditItem.html'
], function($, _, JQueryForm, Backbone, FileUpload, BBXFunctions, MediaFunctions, MediaModel, MucuaModel, MucuaCollection, MediaGalleryEditTpl, MediaGalleryEditItemTpl){
    
    var MediaGalleryEdit = Backbone.View.extend({	
	render: function(subroute){
	    var config = $("body").data("bbx").config,
		url = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/bbx/search/' + subroute,
		urlToken = config.apiUrl + "/" + config.MYREPOSITORY + "/" + config.MYMUCUA + "/media/token",
		mediaToken = new MediaModel([], {url: urlToken});
	    
	    BBXFunctions.renderSidebar();
	    MediaFunctions.getMediaGallery(url);
	    BBXFunctions.renderUsage();
	    
	    // get token
	    mediaToken.fetch({
		success: function() {
		    var csrftoken = $.cookie('csrftoken');
		    $('#csrfmiddlewaretoken').attr('value', csrftoken);		    
		}
	    });
	}
    });
    
    return MediaGalleryEdit;
});
    
