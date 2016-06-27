define([
    'jquery', 
    'lodash',
    'backbone',
    'modules/bbx/functions',
    'modules/media/functions',
    'modules/mocambola/model'
], function($, _, Backbone, BBXFunctions, MediaFunctions, MocambolaModel) {
    var HomeMocambola = Backbone.View.extend({
	el: "body",    

	__getMocambola: function(username, limit) {
	    var config = BBX.config,
	    limit = limit || '',
	    url = '',
	    mocambola = null;
	    
	    if (limit !== '') {
		limit = '/limit/' + limit;
	    }
	    url = config.apiUrl + '/' + config.repository + '/'+ config.mucua + '/mocambola/' + username + limit,
	    
	    mocambola = new MocambolaModel([], {url: url});
	    mocambola.fetch({
		success: function() {
		    var data = {};
		    BBX.mocambola = mocambola.attributes;
		}
	    });
	},

	render: function(username, limit) {
	    var config = BBX.config,
	    data = {},
	    limit = limit || '';
	    
	    config.userData = JSON.parse(localStorage.userData);
	    data.config = config;
	    BBXFunctions.renderUsage();
	    BBXFunctions.renderSidebar();
	    // get mocambola data
	    this.__getMocambola(username);
	    var mocambolaDOM = '';
	    var getMocambolaLoad = setInterval(function() {
		mocambolaDOM = BBX.mocambola;
		if ((typeof mocambolaDOM !== 'undefined') && (mocambolaDOM !== '')) {
		    data.mocambola = mocambolaDOM;
		    
		    data.mocambola.avatar = BBXFunctions.getAvatar();
		    TemplateManager.get('/templates/' + BBX.userLang + '/mocambola/HomeMocambola', function(HomeMocambolaTpl) {
			$('#content').html(_.template(HomeMocambolaTpl, data));
			MediaFunctions.getMediaByMocambola('all', username, limit);
			
			// get languages
			$.ajax({
			    url: config.apiUrl + '/lang/available',
			    type: 'GET',
			    success: function(data) {
				BBX.langs = data.availableLangs;
				TemplateManager.get('/templates/' + BBX.userLang + '/mocambola/AvailableLangs', function(AvailableLangsTpl) {
				    $('#default-language').html(_.template(AvailableLangsTpl));
				    $('#change-language-btn').click(function() {
					$('#change-language select').enable(true);
				    });
				});
				$('#default-language').change(function() {
				    var new_lang = $('#default-language').val();
				    $('#change-language .message').css({"display": "inline"});
				    $.post(config.apiUrl + '/lang/change_interface_lang', {
					'current_lang': BBX.userLang,			    
					'new_lang': new_lang
				    }, function (data) {
					BBX.userLang = new_lang;
					location.reload()
				    });
				});
			    }
			});
		    });
		    
		    BBX.mocambola = '';
		    clearInterval(getMocambolaLoad);
		}
	    }, 50);
	}
    });

    return HomeMocambola;
});
