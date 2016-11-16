define([
    'jquery', 
    'lodash',
    'backbone',
    'modules/media/functions',
    'modules/repository/model',
    'text!/templates/' + BBX.userLang + '/repository/HomeRepository.html',
], function($, _, Backbone, MediaFunctions, RepositoryModel, HomeRepositoryTpl) {
    var HomeRepository = Backbone.View.extend({
	el: "body",    
	
	render: function(username) {
	    var config = BBX.config,
		data = {};
	    
	    config.userData = localStorage.userData;
	    data.config = config;
	    BBXFunctions.renderSidebar();
	    
	    $('#content').html(_.template(HomeRepositoryTpl, data));
	}
    });

    return HomeRepository;
});
