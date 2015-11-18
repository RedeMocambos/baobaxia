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
    'text!templates/' + BBX.userLang + '/media/MediaGalleryEdit.html',
    'text!templates/' + BBX.userLang + '/media/MediaGalleryEditItem.html'
], function($, _, JQueryForm, Backbone, FileUpload, BBXFunctions, MediaFunctions, MediaModel, MucuaModel, MucuaCollection, MediaGalleryEditTpl, MediaGalleryEditItemTpl){
    
    var MediaGalleryEdit = Backbone.View.extend({	
	render: function(subroute, limit){
	    var config = BBX.config,
		limit = (limit) ? '/limit/' + limit : '',
		url = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/bbx/search/' + subroute + limit;	   
	    console.log(url);
	    BBXFunctions.renderSidebar();
	    MediaFunctions.getMediaGallery(url);
	    BBXFunctions.renderUsage();
	}
    });
    
    return MediaGalleryEdit;
});
    
