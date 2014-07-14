define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/bbx/base-functions',
    'modules/media/media-functions',
], function($, _, Backbone, BBXBaseFunctions, MediaFunctions) {
    var NetworkView = Backbone.View.extend({
	el: "body",    

	render: function(username) {
	    var config = $("body").data("bbx").config;
	    
	    MediaFunctions.getMediaByMocambola('all', username);
	}
    });

    return NetworkView;
});