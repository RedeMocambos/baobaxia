define([
    'jquery', 
    'lodash',
    'backbone',
    'modules/bbx/functions',
    'modules/media/functions',
    'modules/repository/model',
    'text!/api/templates/' + userLang + '/repository/HomeRepository.html',
], function($, _, Backbone, BBXFunctions, MediaFunctions, RepositoryModel, HomeRepositoryTpl) {
    var HomeRepository = Backbone.View.extend({
	el: "body",    
	
	render: function(username) {
	    var config = $("body").data("bbx").config,
	    data = {};
	    
	    config.userData = BBXFunctions.getFromCookie('userData');
	    data.config = config;
	    BBXFunctions.renderSidebar();
	    
	    $('#content').html(_.template(HomeRepositoryTpl, data));
	}
    });

    return HomeRepository;
});
