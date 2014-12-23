define([
    'jquery', 
    'lodash',
    'backbone',
    'modules/bbx/functions',
    'modules/media/functions',
    'modules/repository/model',
    'modules/mucua/model',
    'text!/templates/' + BBX.userLang + '/repository/ListMucuas.html',
], function($, _, Backbone, BBXFunctions, MediaFunctions, RepositoryModel, MucuaModel, ListMucuasTpl) {
    var ListMucuas = Backbone.View.extend({
	el: "body", 

	parseMucuaImage: function(mucua) {
	    var urlMucuaImage = BBX.config.apiUrl + '/' + BBX.config.MYREPOSITORY + '/' + mucua.description + '/bbx/search/' + mucua.uuid,
		mucuaModel  = new MucuaModel(),
		mucuaImageSrc = mucuaModel.getImage(urlMucuaImage, function(imageSrc){
		    var el = 'item-mucua ' + mucua.description;
		    $('.' + mucua.description + ' a').prepend('<img id="mucua_image" src="' + imageSrc + '" />');
		}, "/images/avatar-default.png", 45, 45);
	    
	},
	
	render: function() {
	    var config = $("body").data("bbx").config,
		url = config.apiUrl + '/' + config.repository + '/mucuas',
		mucuas = new MucuaModel([], {url: url}),
		data = {};
	    
	    config.userData = BBXFunctions.getFromCookie('userData');
	    data.config = config;
	    
	    BBXFunctions.renderSidebar();
	    mucuas.parseMucuaImage = this.parseMucuaImage;
	    mucuas.fetch({
		success: function() {
		    data.mucuas = mucuas.attributes;
		    
		    _.each(data.mucuas, function(mucua) {
			mucuas.parseMucuaImage(mucua);
		    });

		    $('.media-display-type').html('');
		    $('#content').html(_.template(ListMucuasTpl, data));
		}
	    });
	}
    });

    return ListMucuas;
});
