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
	    url = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/media/' + uuid;
	    console.log("usuário logado? " +  BBXBaseFunctions.isLogged());
	    
	    if (typeof $.cookie('sessionBBX') !== 'undefined') {
		config.userData = JSON.parse($.cookie('sessionBBX'));
	    } else {
		config.userData = {};
	    }
	    BBXBaseFunctions.renderSidebar();
	    
	    media = MediaFunctions.getMedia(url, function(data) {
		data.formatDate = BBXBaseFunctions.formatDate;
		data.media = data.medias;
		data.config = config;
		data.baseUrl = BBXBaseFunctions.getDefaultHome();
		$('#back-to-results').html("<a class='back-to-results' href='javascript: history.back(-1)'><img src='" + config.imagePath + "/voltar.png'> voltar para a busca</a>");
		$('#content').html(_.template(MediaViewTpl, data));
		
		// get image
		

	    });
	    
	    // pegar media
	    // dar o parse do media
	    
	}
    });
    return MediaView;
});