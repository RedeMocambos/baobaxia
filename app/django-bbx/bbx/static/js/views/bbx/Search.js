define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/bbx/base-functions',
    'modules/media/media-functions',
], function($, _, Backbone, BBXBaseFunctions, MediaFunctions) {
    var SearchView = Backbone.View.extend({
	el: "body",    

	render: function(subroute) {
	    var config = $("body").data("bbx").config,
	    url = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/bbx/search/' + subroute;

	    BBXBaseFunctions.renderSidebar();
	    MediaFunctions.getMediaSearch(url);
	    BBXBaseFunctions.renderUsage();

	    var focus = setInterval(function() {
		var activeElId = document.activeElement.id;
		if (activeElId != 'caixa_busca') {
		    $('#caixa_busca').focus();
		    clearInterval(focus);
		}
	    }, 500);
	}
    });

    return SearchView;
});
