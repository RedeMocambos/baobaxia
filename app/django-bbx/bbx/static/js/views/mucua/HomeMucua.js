define([
    'jquery', 
    'lodash',
    'backbone',
    'modules/mucua/model',
    'modules/media/model',
    'modules/media/collection',
    'modules/media/functions',
    'modules/mocambola/model',
    'text!templates/common/UserProfile.html',
    'text!templates/common/MucuaProfile.html',
    'text!templates/mucua/HomeMucua.html',
], function($, _, Backbone, MucuaModel, MediaModel, MediaCollection, MediaFunctions, MocambolaModel, UserProfileTpl, MucuaProfileTpl, HomeMucuaTpl) {
    var MucuaView = Backbone.View.extend({
	el: "body",
	
	render: function() {
	    var config = BBX.config,
	    urlMucua = config.apiUrl +  '/mucua/by_name/' + config.mucua;
	    console.log('render mucua');
	    
	    // start mucua DOM field
	    $("body").data("bbx").mucua = {};
	    $("body").data("bbx").media = {};	    
	    BBXFunctions.renderSidebar();
	    BBXFunctions.renderUsage();
	    $('.media-display-type').remove();

	    // get specific content
	    MediaFunctions.getMediaByMucua('#content', 4);
	    MediaFunctions.getMediaByNovidades('#content', 4);
	    
	    //TODO: get cloud
	    MediaFunctions.getTagCloud('#sidebar');
	}
    });
    
    return MucuaView;
});
