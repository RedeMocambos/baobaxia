define([
    'jquery', 
    'underscore',
    'backbone', 
    'modules/bbx/functions',
    'modules/media/functions',
    'modules/media/model',
    'text!templates/media/MediaView.html'
], function($, _, Backbone, BBXFunctions, MediaFunctions, MediaModel, MediaViewTpl){
    
    var MediaView = Backbone.View.extend({
	
	render: function(uuid){
	    console.log("view media " + uuid);	    
	    var config = $("body").data("bbx").config,
	    media = '',
	    url = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/media/' + uuid,
	    urlWhereis = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/media/' + uuid + '/whereis';
	    
	    var userData = BBXFunctions.getFromCookie('userData');
	    if (userData) {
		config.userData = userData;
	    } else {
		config.userData = {};
	    }
	    
	    $('#buscador').remove();
	    $('#header-results').remove();
	    $('.media-display-type').remove();
	    BBXFunctions.renderUsage();
	    BBXFunctions.renderSidebar();
	    
	    // set focus on back to results button
	    var focus = setInterval(function() {
		var activeElId = document.activeElement.id;
		if (activeElId != '.back-to-results') {
		    $('.back-to-results').focus();
		    clearInterval(focus);
		}
	    }, 500);
	    
	    media = MediaFunctions.getMedia(url, function(data) {
		data.formatDate = BBXFunctions.formatDate;
		data.media = data.medias[0];
		data.config = config;
		data.baseUrl = BBXFunctions.getDefaultHome();
		$('#header-bottom').append("<div id='back-to-results'><a class='back-to-results' href='javascript: history.back(-1)'><img src='" + config.imagePath + "/voltar.png'> voltar para a busca</a></div>");
		$('#content').html(_.template(MediaViewTpl, data));
		// TODO: add an event to monitor scroll
		// if scroll reaches the end, load more content
		//$('body').on('scroll', function() {
		//		    console.log('scroll');
		//});
	    }, {'width': '400', 'height': '00' });
	    
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
