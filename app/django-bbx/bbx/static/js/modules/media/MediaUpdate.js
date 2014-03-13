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
	    
	    swap_license = function() {
		$('#license option:selected').each(function() {
		    l = $(this);
		    if (!_.isEmpty(l.val())) {
			license = 'license-' + l.val();
			console.log(license);
			$('#license_image').attr('class', license);
		    }
		});		
	    }
	    
	    repository = $('body').data('data').repository;
	    mucua = $('body').data('data').mucua;
	    baseurl = '#' + repository + '/' + mucua;
	    url = $('body').data('data').config.apiUrl + '/' + repository + '/' +  mucua + '/media/' + uuid;
	    console.log(url);

	    // TODO: pegar licenças da API ou outra forma
	    var licenses = {
		'': '',
		'gplv3': 'gpl v3 - gnu general public license',
		'gfdl': 'gfdl - gnu free documentation license',
		'lgplv3': 'lgpl v3 - gnu lesser public license',
		'agplv3': 'agpl v3 - gnu affero public license',
		'copyleft':  'copyleft',
		'cc': 'creative commons - atribuição',
		'cc_nc': 'creative commons - atribuição - não comercial',
		'cc_ci': 'creative commons - atribuição - compartilha igual',
		'cc_ci_nc': 'creative commons - atribuição - compartilha igual - não comercial',
		'cc_sd': 'creative commons - atribuição - sem derivação',
		'cc_sd_nc': 'creative commons - atribuição - sem derivação - não comercial'
	    }
	    
	    var media = new MediaModel([], {url: url});
	    media.fetch({
		success: function() {
		    // TODO: passar caminho da imagem preview
		    media.image_preview = '';
		    var data = {
			media: media,
			baseurl: baseurl,
			licenses: licenses
		    }
		    
		    var compiledTpl = _.template(MediaEditFormTpl, data);
		    $('#content').html(compiledTpl);  

		    // eventos		  
		    $('#license').on('change', swap_license);
		}
	    });
	},
    });

    return MediaUpdate;
});