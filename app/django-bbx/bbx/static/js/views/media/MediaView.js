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
	    url = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/media/' + uuid,
	    urlWhereis = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/media/' + uuid + '/whereis';
	    
	    var userData = BBXBaseFunctions.getFromCookie('userData');
	    if (userData) {
		config.userData = userData;
	    } else {
		config.userData = {};
	    }
	    BBXBaseFunctions.renderUsage();
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

	    // who has the file
	    var dataWhereis = new MediaModel([], {url: urlWhereis});
	    dataWhereis.fetch({
		success: function() {
		    var mucuas = dataWhereis.attributes.whereis;		    
		    _.each(mucuas, function(mucua) {
			$('#whereis').append('<a href="' + config.interfaceUrl + config.MYREPOSITORY + '/' + mucua.description + '">' + mucua.description + '</a>&nbsp;');
		    });
		}
	    });
	}
    });
    return MediaView;
});
