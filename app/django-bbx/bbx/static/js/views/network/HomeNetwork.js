define([
    'jquery', 
    'lodash',
    'backbone',
    'modules/bbx/functions',
    'modules/media/functions',
], function($, _, Backbone, BBXFunctions, MediaFunctions) {
    var NetworkView = Backbone.View.extend({
	el: "body",    

	render: function(subroute) {
	    var config = $("body").data("bbx").config,
	    url = config.apiUrl + '/rede/bbx/search/' + subroute;
	    
	    BBXFunctions.renderUsage();
	    BBXFunctions.renderSidebar();
	    MediaFunctions.getMediaSearch(url);
	}
    });

    return NetworkView;
});
