define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/bbx/base-functions',
    'modules/mucua/model',
    'modules/media/model',
    'modules/media/collection',
    'modules/media/media-functions',
    'modules/mocambola/model',
    'text!templates/common/UserProfile.html',
    'text!templates/common/MucuaProfile.html',
    'text!templates/mucua/HomeMucua.html',
], function($, _, Backbone, BBXBaseFunctions, MucuaModel, MediaModel, MediaCollection, MediaFunctions, MocambolaModel, UserProfileTpl, MucuaProfileTpl, HomeMucuaTpl) {
    var MucuaView = Backbone.View.extend({
	el: "body",
	
	getMucuaResources: function(uuid) {
	    var config = $("body").data("bbx").config,
	    url = config.apiUrl + '/mucua/' + uuid + '/info',
	    mucua = '';
	    console.log(url);
	    
	    mucua = new MucuaModel([], {url: url});
	    mucua.fetch({
		success: function() {
		    $("body").data("bbx").mucua.info = mucua.attributes;
		}
	    });
	},
	
	render: function() {
	    var config = $("body").data("bbx").config,
	    urlMucua = config.apiUrl +  '/mucua/by_name/' + config.mucua;
	    console.log('render mucua');
	    // start mucua DOM field
	    $("body").data("bbx").mucua = {};
	    $("body").data("bbx").media = {};	    
	    // set as global function
	    BBX.getMucuaResources = this.getMucuaResources;
	    
	    BBXBaseFunctions.renderSidebar();
	    
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
		    $('#content').html(_.template(HomeMucuaTpl, data));
		    // get mucua resources
		    BBX.getMucuaResources(data.mucua.uuid);		   
		    var mucuaDOM = $("body").data("bbx").mucua;
		    var mucuaResourcesLoad = setInterval(function() {
			if (typeof mucuaDOM.info === 'object') {
			    clearInterval(mucuaResourcesLoad);
			    
			    data.mucua.totalDiskSpace = mucuaDOM.info['total disk space'];
			    data.mucua.usedByAnnex = mucuaDOM.info['local annex size'];
			    data.mucua.usedByOther = mucuaDOM.info['local used by other'];
			    data.mucua.availableLocalDiskSpace = mucuaDOM.info['available local disk space'];
			    data.mucua.demanded = 0;
			    
			    // TODO: treat this as a changable variable
			    data.config = config;
			    $('#place-profile').html(_.template(MucuaProfileTpl, data));
			    
			    BBXBaseFunctions.renderUsage(data.mucua);
			}
		    }, 50);
		    
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
