define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/bbx/base-functions',
    'modules/media/media-functions',
    'modules/repository/model',
    'text!templates/repository/HomeRepository.html',
], function($, _, Backbone, BBXBaseFunctions, MediaFunctions, RepositoryModel, HomeRepositoryTpl) {
    var HomeRepository = Backbone.View.extend({
	el: "body",    
	
	render: function(username) {
	    var config = $("body").data("bbx").config,
	    data = {};
	    
	    config.userData = BBXBaseFunctions.getFromCookie('userData');
	    data.config = config;
	    BBXBaseFunctions.renderSidebar();
	    
	    $('#content').html(_.template(HomeRepositoryTpl, data));
	}
    });

    return HomeRepository;
});