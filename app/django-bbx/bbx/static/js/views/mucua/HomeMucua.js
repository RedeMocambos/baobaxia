define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/mucua/model',
    'modules/media/model',
    'modules/media/collection',
    'modules/media/media-functions',
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
	    BBXBaseFunctions.renderSidebar();
	    BBXBaseFunctions.renderUsage();
	    // get specific content
	    MediaFunctions.getMediaByMucua('#mucua-home');
	    MediaFunctions.getMediaByNovidades();
	    	    
	    var mucua = new MucuaModel([], {url: urlMucua});
	    mucua.fetch({
		success: function() {
		    // get mucua data
		    var data = {};
		    data.mucua = mucua.attributes;
		    data.mucua.url = "http://www.mocambos.net";
		    data.mucua.image = config.imagePath + '/mucua-default.png';
		    data.config = BBX.config;
		    $('#content').html(_.template(HomeMucuaTpl, data));
		    $('#place-profile').html(_.template(MucuaProfileTpl, data));
		    
		    //TODO: get cloud
		    /*
		      $.fn.tagcloud.defaults = {
		        size: {start: 10, end: 16, unit: 'pt'},
		        color: {start: '#fada53', end: '#fada53'}
		      };
			      
		      $(function () {
		        $('#tag_cloud a').tagcloud();
		      });
		     */
		}
	    });	    
	}
    });
    
    return MucuaView;
});
