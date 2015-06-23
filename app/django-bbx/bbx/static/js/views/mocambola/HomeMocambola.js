define([
    'jquery', 
    'lodash',
    'backbone',
    'modules/bbx/functions',
    'modules/media/functions',
    'modules/mocambola/model',
    'text!/templates/' + BBX.userLang + '/mocambola/HomeMocambola.html',
], function($, _, Backbone, BBXFunctions, MediaFunctions, MocambolaModel, HomeMocambolaTpl) {
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
	    
	    config.userData = localStorage.userData;
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
		    $('#content').html(_.template(HomeMocambolaTpl, data));
		    MediaFunctions.getMediaByMocambola('all', username, limit);
		    BBX.mocambola = '';
		    clearInterval(getMocambolaLoad);
		}
	    }, 50);
	}
    });

    return HomeMocambola;
});
