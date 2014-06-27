define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/bbx/base-functions',
    'modules/mucua/model',
    'modules/mucua/collection',
    'modules/mocambola/model',
    'text!templates/common/user-profile.html',
    'text!templates/common/mucua-profile.html',
], function($, _, Backbone, BBXBaseFunctions, MucuaModel, MucuaCollection, MocambolaModel, UserProfileTpl, MucuaProfileTpl){
    var MucuaView = Backbone.View.extend({
	el: "body",
	
	getMucuaResources: function(uuid) {
	    var config = $("body").data("bbx").config;
	    url = config.apiUrl + '/mucua/' + uuid + '/info';
	    mucua = new MucuaModel([], {url: url});
	    mucua.fetch({
		success: function() {
		    $("body").data("bbx").mucua.info = mucua.attributes;
		}
	    });
	},
	
	render: function() {
	    $('#content').html('Home da mucua');
	    var config = $("body").data("bbx").config,
	    urlMucua = config.apiUrl +  '/mucua/' + config.myMucua;
	    // start mucua DOM field
	    $("body").data("bbx").mucua = {};
	    
	    // set as global function
	    getMucuaResources = this.getMucuaResources;
	    
	    if (BBXBaseFunctions.isLogged()) {
		var userProfile = $.parseJSON($.cookie('sessionBBX'));
		userProfile.mocambolaUrl = BBXBaseFunctions.getDefaultHome() + '/mocambola/' + userProfile.username
		userProfile.avatar = BBXBaseFunctions.getAvatar();
		$('#sidebar').append(_.template(UserProfileTpl, userProfile));
	    }
	    
	    var mucua = new MucuaModel([], {url: urlMucua});
	    mucua.fetch({
		success: function() {
		    // get mucua data
		    var mucuaData = mucua.attributes[0];
		    mucuaData.url = "http://www.mocambos.net";
		    mucuaData.image = config.imagePath + '/mucua-default.png';
		    
		    // get mucua resources
		    getMucuaResources(mucuaData.uuid);		   
		    mucuaDOM = $("body").data("bbx").mucua;
		    mucuaResourcesLoad = setInterval(function() {
			if (typeof mucuaDOM.info !== 'undefined') {
			    mucuaData.storageSize = mucuaDOM.info['local annex size'];
			    mucuaData.storageAvailable = mucuaDOM.info['available local disk space'];
			    // TODO: treat this as a changable variable
			    mucuaData.demanded = 0;
			    $('#sidebar').append(_.template(MucuaProfileTpl, mucuaData));			    
			    
			    // usage data - mucua footer
			    // TODO: get from mucua / git annex
			    var usageData = {
				total: mucuaData.storageSize,
				used: mucuaData.storageAvailable,
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
		-> media.getContentByMucua(mucua) # retorna lista de conteúdos da mucua
		-> mucua.getData()              # retorna lista de dados gerais da mucua
		-> mucua.getResources()         # retorna infos sobre os recursos da mucua
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