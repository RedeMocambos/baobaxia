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
	    url = config.apiUrl + '/' + config.defaultRepository.name + '/rede/bbx/search/' + subroute;
	    console.log(url);
	    MediaFunctions.getMediaSearch(url);
	}
    });

    return NetworkView;
});