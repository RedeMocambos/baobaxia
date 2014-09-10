define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/bbx/base-functions',
    'modules/media/media-functions',
    'modules/repository/model',
    'modules/mucua/model',
    'text!templates/repository/ListMucuas.html',
], function($, _, Backbone, BBXBaseFunctions, MediaFunctions, RepositoryModel, MucuaModel, ListMucuasTpl) {
    var ListMucuas = Backbone.View.extend({
	el: "body",    
	
	render: function() {
	    var config = $("body").data("bbx").config,
	    url = config.apiUrl + '/' + config.repository + '/mucuas',
	    mucuas = new MucuaModel([], {url: url}),
	    data = {};
	    
	    config.userData = BBXBaseFunctions.getFromCookie('userData');
	    data.config = config;
	    console.log(data);
	    BBXBaseFunctions.renderSidebar();
	    
	    
	    mucuas.fetch({
		success: function() {
		    data.mucuas = mucuas.attributes;
		    $('.media-display-type').html('');
		    $('#content').html(_.template(ListMucuasTpl, data));
		}
	    });
	}
    });

    return ListMucuas;
});