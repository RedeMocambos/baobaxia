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
	
	render: function() {
	    $('#content').html('Home da mucua');
	    var config = $("body").data("bbx").config;
	    
	    if (BBXBaseFunctions.isLogged()) {
		var userProfile = $.parseJSON($.cookie('sessionBBX'));
		userProfile.mocambolaUrl = BBXBaseFunctions.getDefaultHome() + '/mocambola/' + userProfile.username
		userProfile.avatar = BBXBaseFunctions.getAvatar();
		$('#sidebar').append(_.template(UserProfileTpl, userProfile));
	    }
	    
	    urlMucua = config.apiUrl +  '/mucua/' + config.myMucua;
	    var mucua = new MucuaModel([], {url: urlMucua});
	    mucua.fetch({
		success: function() {
		    mucuaData = mucua.attributes[0];
		    mucuaData.url = "http://www.mocambos.net";
		    mucuaData.image = config.imagePath + '/mucua-default.png';
		    mucuaData.storageSize = 300;
		    $('#sidebar').append(_.template(MucuaProfileTpl, mucuaData));
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
	    //mucua.get(config.myMucua);	    
	    
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
	    
	    // usage data - mucua footer
	    // TODO: get from mucua / git annex
	    var usageData = {
		total: 260,
		used: 100,
		demanded: 20
	    }
	    BBXBaseFunctions.renderUsage(usageData);
	}
    });
    
    return MucuaView;
});