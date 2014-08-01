define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/bbx/base-functions',
    'modules/media/media-functions',
    'modules/mocambola/model',
    'text!templates/mocambola/HomeMocambola.html',
], function($, _, Backbone, BBXBaseFunctions, MediaFunctions, MocambolaModel, HomeMocambolaTpl) {
    var NetworkView = Backbone.View.extend({
	el: "body",    

	__getMocambola: function(username) {
	    var config = $("body").data("bbx").config,
	    url = config.apiUrl + '/' + config.repository + '/'+ config.mucua + '/mocambola/' + username,
	    mocambola = '';
	    
	    mocambola = new MocambolaModel([], {url: url});
	    mocambola.fetch({
		success: function() {
		    var data = {};
		    $("body").data("bbx").mocambola = mocambola.attributes;
		}
	    });
	},

	render: function(username) {
	    var config = $("body").data("bbx").config,
	    data = {};
	    
	    config.userData = BBXBaseFunctions.getFromCookie('userData');
	    data.config = config;
	    BBXBaseFunctions.renderSidebar();

	    // get mocambola data
	    this.__getMocambola(username);
	    var mocambolaDOM = '';
	    var getMocambolaLoad = setInterval(function() {
		mocambolaDOM = $("body").data("bbx").mocambola;
		if (typeof mocambolaDOM !== 'undefined') {
		    data.mocambola = mocambolaDOM;
		    data.mocambola.avatar = BBXBaseFunctions.getAvatar();
		    $('#content').html(_.template(HomeMocambolaTpl, data));
		    MediaFunctions.getMediaByMocambola('all', username);
		    clearInterval(getMocambolaLoad);
		}
	    }, 50);
	}
    });

    return NetworkView;
});