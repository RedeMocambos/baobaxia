define([
    'jquery', 
    'underscore',
    'backbone', 
    'modules/bbx/base-functions',
    'modules/media/media-functions',
    'modules/media/model',
    'text!templates/media/MediaView.html'
], function($, _, Backbone, BBXBaseFunctions, MediaFunctions, MediaModel, MediaViewTpl){
    
    var MediaView = Backbone.View.extend({
	
	render: function(uuid){
	    console.log("view media " + uuid);	    
	    var config = $("body").data("bbx").config,
	    media = '',
	    url = config.apiUrl + '/' + config.defaultRepository.name + '/' + config.myMucua + '/media/' + uuid;
	    console.log("usuário logado? " +  BBXBaseFunctions.isLogged());
	    BBXBaseFunctions.renderSidebar();
	    
	    media = MediaFunctions.getMedia(url, function(data) {
		data.media = data.medias;
		data.config = config;
		
		data.baseUrl = BBXBaseFunctions.getDefaultHome();
		$('#result-string').html("<a href='javascript: history.back(-1)'>voltar</a>");
		$('#content').html(_.template(MediaViewTpl, data));
	    });
	    
	    // pegar media
	    // dar o parse do media
	    
	}
    });
    return MediaView;
});