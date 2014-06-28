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
    'text!templates/common/user-profile.html',
    'text!templates/common/mucua-profile.html',
], function($, _, Backbone, BBXBaseFunctions, MucuaModel, MediaModel, MediaCollection, MediaFunctions, MocambolaModel, UserProfileTpl, MucuaProfileTpl) {
    var MucuaView = Backbone.View.extend({
	el: "body",
	
	getMucuaResources: function(uuid) {
	    var config = $("body").data("bbx").config,
	    url = config.apiUrl + '/mucua/' + uuid + '/info',
	    mucua = new MucuaModel([], {url: url});
	    mucua.fetch({
		success: function() {
		    $("body").data("bbx").mucua.info = mucua.attributes;
		}
	    });
	},
	
	render: function() {
	    var config = $("body").data("bbx").config,
	    urlMucua = config.apiUrl +  '/mucua/' + config.myMucua;
	    // start mucua DOM field
	    $("body").data("bbx").mucua = {};
	    $("body").data("bbx").media = {};	    
	    // set as global function
	    BBX.getMucuaResources = this.getMucuaResources;
	    
	    if (BBXBaseFunctions.isLogged() &&
		((typeof $("#user-profile").html() === "undefined") || $("#user-profile").html() == "")) {
		var userProfile = $.parseJSON($.cookie('sessionBBX'));
		console.log(userProfile);
		userProfile.mocambolaUrl = BBXBaseFunctions.getDefaultHome() + '/mocambola/' + userProfile.username
		userProfile.avatar = BBXBaseFunctions.getAvatar();
		$('#user-profile').html(_.template(UserProfileTpl, userProfile));
	    }
	    
	    // get specific content
	    MediaFunctions.getMediaByMucua();
	    MediaFunctions.getMediaByNovidades();
	    
	    
	    var mucua = new MucuaModel([], {url: urlMucua});
	    mucua.fetch({
		success: function() {
		    // get mucua data
		    var mucuaData = mucua.attributes[0];
		    mucuaData.url = "http://www.mocambos.net";
		    mucuaData.image = config.imagePath + '/mucua-default.png';
		    
		    // get mucua resources
		    BBX.getMucuaResources(mucuaData.uuid);		   
		    var mucuaDOM = $("body").data("bbx").mucua;
		    var mucuaResourcesLoad = setInterval(function() {
			if (typeof mucuaDOM.info !== 'undefined') {
			    mucuaData.storageSize = mucuaDOM.info['local annex size'];
			    mucuaData.storageAvailable = mucuaDOM.info['available local disk space'];
			    // TODO: treat this as a changable variable
			    mucuaData.demanded = 0;
			    $('#place-profile').html(_.template(MucuaProfileTpl, mucuaData));			    
			    
			    // usage data - mucua footer
			    // TODO: get from mucua / git annex
			    var usageData = {
				total: mucuaData.storageAvailable,
				used: mucuaData.storageSize,
				demanded: mucuaData.demanded
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
	    /*
		-> media.getContentByMucua(mucua) # retorna lista de conteúdos da mucua - 
		-> mucua.getData()              # retorna lista de dados gerais da mucua - OK
		-> mucua.getResources()         # retorna infos sobre os recursos da mucua - OK / semi
		-> media.getTagCloudByMucua(mucua)  # retorna nuvem de tag da mucua
		-> media.getDestaquesMucua(mucua) # retorna lista de destaques por mucua
		-> media.getNovidadesMucua(mucua) # retorna lista de novidades por mucua
		-> media.getNovidadesRede() # retorna lista de novidades da rede
		-> media.checkFunctionalTag()   # verifica por tags funcionais
	    */
	}
    });
    
    return MucuaView;
});