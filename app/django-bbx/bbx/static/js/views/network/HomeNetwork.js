define([
    'jquery', 
    'lodash',
    'backbone',
    'modules/media/functions',
], function($, _, Backbone, MediaFunctions) {
    var NetworkView = Backbone.View.extend({
	el: "body",    

	render: function(subroute) {
	    var config = BBX.config,
		url = config.apiUrl + '/rede/bbx/search/' + subroute;
	    
	    BBXFunctions.renderUsage();
	    BBXFunctions.renderSidebar();
	    MediaFunctions.getMediaSearch(url);
	}
    });

    return NetworkView;
});
