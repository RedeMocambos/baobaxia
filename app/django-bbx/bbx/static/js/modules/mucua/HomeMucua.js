define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/bbx/base-functions',
    'modules/mucua/model',
    'modules/media/model',
    'modules/media/collection',
    'modules/mocambola/model',
    'text!templates/common/user-profile.html',
    'text!templates/common/mucua-profile.html',
    'text!templates/media/MediaDestaquesMucua.html',
    'text!templates/media/MediaNovidades.html',
    'text!templates/media/MediaGrid.html',
], function($, _, Backbone, BBXBaseFunctions, MucuaModel, MediaModel, MediaCollection, MocambolaModel, UserProfileTpl, MucuaProfileTpl, MediaDestaquesMucua, MediaNovidades, MediaGrid){
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
	
	__getMediaByMucua: function() {
	    var config = $("body").data("bbx").config;
	    url = config.apiUrl + '/' + config.defaultRepository.name + '/' + config.myMucua + '/bbx/search' ;
	    var media = new MediaModel([], {url: url});
	    media.fetch({
		success: function() {
		    //$("body").data("bbx").media.byMucua = media.attributes;
		    mediaData = {
			medias: media.attributes,
			emptyMessage: 'Nenhum conteúdo em destaque.'
		    };
		    $('#content').prepend(_.template(MediaDestaquesMucua));
		    $('#destaques-mucua .media').html(_.template(MediaGrid, mediaData));		    
		}
	    });
	},

	__getMediaByNovidades: function() {
	    var config = $("body").data("bbx").config;
	    // TODO: apontar para endereco dos ultimos conteudos
	    url = config.apiUrl + '/' + config.defaultRepository.name + '/' + config.myMucua + '/bbx/search' ;
	    var media = new MediaModel([], {url: url});
	    media.fetch({
		success: function() {
		    //$("body").data("bbx").media.byMucua = media.attributes;
		    mediaData = {
			medias: media.attributes,
			emptyMessage: 'Nenhum conteúdo em destaque.'
		    };
		    $('#content').append(_.template(MediaNovidades));
		    $('#novidades .media').html(_.template(MediaGrid, mediaData));		    
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
	    getMucuaResources = this.getMucuaResources;
	    
	    if (BBXBaseFunctions.isLogged()) {
		var userProfile = $.parseJSON($.cookie('sessionBBX'));
		userProfile.mocambolaUrl = BBXBaseFunctions.getDefaultHome() + '/mocambola/' + userProfile.username
		userProfile.avatar = BBXBaseFunctions.getAvatar();
		$('#sidebar').append(_.template(UserProfileTpl, userProfile));
	    }
	    
	    // get specific content
	    this.__getMediaByMucua();
	    this.__getMediaByNovidades();
	    
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
			    console.log(mucuaData);
			    $('#sidebar').append(_.template(MucuaProfileTpl, mucuaData));			    
			    
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