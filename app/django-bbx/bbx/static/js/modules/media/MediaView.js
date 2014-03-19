define([
    'jquery', 
    'underscore',
    'backbone', 
    'modules/bbx/base-functions',
    'modules/media/model',
    'text!templates/media/MediaView.html'
], function($, _, Backbone, BBXBaseFunctions, MediaModel, MediaViewTpl){
    
    var MediaView = Backbone.View.extend({
	
	render: function(uuid){
	    console.log("busca media " + uuid);
	    console.log("/" + repository + "/" + mucua + "/medias/" + uuid);
	    
	    this.config = BBXBaseFunctions.getConfig();
	    urlApi = this.config.apiUrl + '/' + repository + '/' +  mucua + '/media/' + uuid;
	    urlMediaView = $('body').data('data').config.interfaceUrl + repository + '/' +  mucua + '/media/' + uuid;
	    baseurl = '#' + repository + '/' + mucua;
	    var media = new MediaModel([], {url: urlApi});
	    media.fetch({
		success: function() {
		    var data = {	
			media: media,
			baseurl: baseurl,
			urlApi: urlApi,
			urlMediaView: urlMediaView,
		    }
		    
		    var compiledTemplate = _.template(MediaViewTpl, data);
		    $('#content').html(compiledTemplate);
		}
	    });
	}
    });
    return MediaView;
});