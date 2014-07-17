define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/bbx/base-functions',
    'modules/media/media-functions',
], function($, _, Backbone, BBXBaseFunctions, MediaFunctions) {
    var NetworkView = Backbone.View.extend({
	el: "body",    

	render: function(subroute) {
	    var config = $("body").data("bbx").config,
	    url = config.apiUrl + '/' + config.repository + '/' + config.mucua + '/bbx/search/' + subroute;
	    
	    BBXBaseFunctions.renderSidebar();	   
	    MediaFunctions.getMediaSearch(url);
	}
    });

    return NetworkView;
});
