define([
    'jquery', 
    'lodash',
    'backbone', 
    'modules/bbx/functions',
    'modules/media/functions',
    'modules/media/model',
    'text!/templates/' + BBX.userLang + '/media/MediaView.html',
    'text!/templates/' + BBX.userLang + '/media/MessageRequest.html',
    'text!/templates/' + BBX.userLang + '/media/MediaDropMessage.html',
    'text!/templates/' + BBX.userLang + '/media/BackToSearch.html',
    'text!/templates/' + BBX.userLang + '/media/MucuaHasFile.html',
], function($, _, Backbone, BBXFunctions, MediaFunctions, MediaModel, MediaViewTpl, MessageRequestTpl, MediaDropMessageTpl, BackToSearchTpl, MucuaHasFileTpl){
    
    var MediaView = Backbone.View.extend({
	
	render: function(uuid){
	    console.log("view media " + uuid);	    
	    var config = BBX.config,
		media = '',
		url = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/media/' + uuid,
		urlWhereis = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/media/' + uuid + '/whereis',
		userData = BBXFunctions.getFromCookie('userData');
	    
	    var askDrop = function() {
		var config = BBX.config,		    
		    dropMedia = confirm(MediaDropMessageTpl);
		
		if (dropMedia) {
		    var urlDrop = config.apiUrl + '/' + config.repository + '/' +  config.mucua + '/media/' + uuid + '/drop',
			mediaDrop = new MediaModel([], {url: urlDrop});
		    
		    mediaDrop.fetch({
			success: function() {
			    setTimeout(function(){
				window.location.reload();
			    }, 500);
			}
		    });
		}
	    }
	    
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
		$('#header-bottom').append(_.template(BackToSearchTpl, data));

		$('#content').html(_.template(MediaViewTpl, data));
		$('#drop-local-copy').on('click', function() {askDrop(media)});
		if (!data.media.is_local) {
		    $('#message-request').html(_.template(MessageRequestTpl, data));
		}
		MediaFunctions.bindRequest(uuid);
		
	    }, {'width': '00', 'height': '300' });
	    
	    // who has the file
	    var dataWhereis = new MediaModel([], {url: urlWhereis});
	    dataWhereis.fetch({
		success: function() {
		    var mucuas = dataWhereis.attributes.whereis;		    
		    _.each(mucuas, function(mucua) {
			var data = {
			    config: config,
			    mucua: mucua
			};
			$('#whereis').append(_.template(MucuaHasFileTpl, data));
		    });
		}
	    });
	}
    });
    return MediaView;
});
