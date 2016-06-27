define([
    'jquery', 
    'lodash',
    'backbone',
    'modules/mucua/model',
    'modules/media/model',
    'modules/media/collection',
    'modules/media/functions',
    'modules/mocambola/model'
], function($, _, Backbone, MucuaModel, MediaModel, MediaCollection, MediaFunctions, MocambolaModel) {
    var MucuaView = Backbone.View.extend({
	el: "body",
	
	render: function() {
	    var config = BBX.config,
		urlMucua = config.apiUrl +  '/mucua/by_name/' + config.mucua;
	    
	    console.log('render mucua');
	    
	    BBXFunctions.renderSidebar();
	    MediaFunctions.getTagCloudBySearch('#cloud');
	    BBXFunctions.renderUsage();
	    $('.media-display-type').remove();

	    // get specific content
	    MediaFunctions.getMediaByMucua('#content', 4);
	    MediaFunctions.getMediaByNovidades('#content', 4);
	    
	    MediaFunctions.getTagCloudByMucua(config.mucua, '#cloud');
	}
    });
    
    return MucuaView;
});
