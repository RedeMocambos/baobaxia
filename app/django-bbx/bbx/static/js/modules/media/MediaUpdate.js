define([
    'jquery', 
    'underscore',
    'jquery_cookie',
    'jquery_form',
    'backbone', 
    'modules/bbx/base-functions',
    'modules/media/model',
    'text!templates/media/MediaEditForm.html'
], function($, _, jQueryCookie, jQueryForm, Backbone, BBXBaseFunctions, MediaModel, MediaEditFormTpl){
    var MediaUpdate = Backbone.View.extend({
	
	render: function(uuid){
	    repository = $('body').data('data').repository;
	    mucua = $('body').data('data').mucua;
	    baseurl = '#' + repository + '/' + mucua;
	    url = $('body').data('data').config.apiUrl + '/' + repository + '/' +  mucua + '/media/' + uuid;
	    console.log(url);
	    var media = new MediaModel([], {url: url});
	    media.fetch({
		success: function() {
		    var data = {	
			media: media,
			baseurl: baseurl,
		    }
		    
		    console.log(data);
		    var compiledTpl = _.template(MediaEditFormTpl, data);
		    $('#content').html(compiledTpl);	    

		    $('#uuid_area').show();
		    $('#arquivo_passo2').show();
		    $('#dados_gerais').show();
		    $('#dia_hora').show();
		    $('#tags_area').show();

		}
	    });
	},
    });

    return MediaUpdate;
});