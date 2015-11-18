define([
    'jquery', 
    'lodash',
    'backbone',
    'jquery_json',
    'modules/auth/functions',
    'modules/bbx/functions',
    'modules/repository/model',
    'modules/mucua/model',
    'modules/mucua/collection',
    'modules/mocambola/model',
    'text!templates/' + BBX.userLang + '/auth/LoginTemplate.html',
    'text!templates/' + BBX.userLang + '/common/HeaderHome.html',
], function($, _, Backbone, jQueryJson, AuthFunctions, BBXFunctions, RepositoryModel, MucuaModel, MucuaCollection, MocambolaModel, LoginTemplate, HeaderHomeTpl){
    var LoginView = Backbone.View.extend({
	el: "body",
	
	events: {
	    "click .submit": "doLogin",
	    "keyup #password": "__checkKeyPress"
	},
	
	__checkKeyPress: function(e) {
	    if (e.keyCode == 13) {
		this.doLogin();
	    } 
	},

	doLogin: function() {
	    AuthFunctions.doLogin();
	},
	
	render: function(){
	    var config = BBX.config;
	    
	    var __parseTemplate = function(data) {
		$('#header').html(_.template(HeaderHomeTpl));
		
		// link para pagina default  bbx/search
		$('#header').on('click', function() {
		    $('#header').unbind('click');
		    window.location.href = BBXFunctions.getDefaultHome();
		});
		
		// clean sidebar
		$('#sidebar').remove();
		
		// parse header
		$('body').removeClass().addClass("home login");
		
		// parse content
		var compiledContent = _.template(LoginTemplate, data);
		$('#content').html(compiledContent);

	    }
	    
	    // get mucuas 
	    var mucuas = new MucuaCollection([], {url: config.apiUrl + '/' + config.MYREPOSITORY + '/mucuas'});
	    mucuas.fetch({
		success: function() {
		    var mucuasLength = mucuas.models.length,
			mucuaList = [],
			data = {};
		    BBX.config.mucuaList = [];
		    
		    for (var m = 0; m < mucuasLength; m++) {
			var mucuaName = mucuas.models[m].attributes;
			mucuaList.push(mucuaName);
		    }
		    // set mucua list
		    BBX.config.mucuaList = mucuaList;
		    var data = {
			defaultRepository: config.repository,
			mucuaList: mucuaList,
			myMucua: config.MYMUCUA,
			repositoryList: config.repositoriesList
		    }
		    __parseTemplate(data);			    
		}
	    });   
	}
    })

    return LoginView;
});
