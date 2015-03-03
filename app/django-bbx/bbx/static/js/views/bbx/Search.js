define([
    'jquery', 
    'lodash',
    'backbone',
    'modules/bbx/functions',
    'modules/media/functions',
], function($, _, Backbone, BBXFunctions, MediaFunctions) {
    var SearchView = Backbone.View.extend({
	el: "body",    

	render: function(subroute) {
	    var config = $("body").data("bbx").config,
		url = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/bbx/search/' + subroute,
		limit = (subroute.match('limit/')) ? subroute.split('limit/')[1] : null;

	    if (url.match('limit/')) {
		url = url.split('/limit/')[0];
	    }
	    
	    BBXFunctions.renderSidebar();
	    MediaFunctions.getMediaSearch(url, limit);
	    BBXFunctions.renderUsage();

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
