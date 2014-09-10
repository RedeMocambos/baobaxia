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
			if (typeof mucuaDOM.info !== 'undefined') {
			    data.mucua.storageSize = mucuaDOM.info['local annex size'];
			    data.mucua.storageAvailable = mucuaDOM.info['available local disk space'];
			    // TODO: treat this as a changable variable
			    data.mucua.demanded = 0;
			    $('#place-profile').html(_.template(MucuaProfileTpl, data));
			    
			    // usage data - mucua footer
			    // TODO: get from mucua / git annex
			    var usageData = {
				total: data.mucua.storageAvailable,
				used: data.mucua.storageSize,
				demanded: data.mucua.demanded
			    }
			    BBXBaseFunctions.renderUsage(usageData);
			    
			    clearInterval(mucuaResourcesLoad);
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