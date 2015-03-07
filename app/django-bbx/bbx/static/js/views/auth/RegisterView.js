define([
    'jquery', 
    'lodash',
    'backbone',
    'modules/auth/functions',
    'modules/bbx/functions',
    'modules/mucua/model',
    'modules/mucua/collection',
    'modules/mocambola/model',
    'views/auth/LoginView',
    'text!/templates/' + BBX.userLang + '/auth/Register.html',
], function($, _, Backbone, AuthFunctions, BBXFunctions, MucuaModel, MucuaCollection, MocambolaModel, LoginView, RegisterTpl){
    var RegisterView = Backbone.View.extend({
	el: "body",
	
	events: {
	    "click .submit": "doRegister",
	    "keyup #password2": "__checkKeyPress"
	},

	__checkKeyPress: function(e) {
	    if (e.keyCode == 13) {
		this.doRegister();
	    } 
	},
	
	doRegister: function() {
	    AuthFunctions.doRegister();
	},

	render: function() {
	    var __parseTemplate = function(data) {
		// clean sidebar
		$('#sidebar').remove();
		// parse header
		$('body').removeClass().addClass("home register login");
		
		// parse content
		var compiledContent = _.template(RegisterTpl, data);
		$('#content').html(compiledContent);
	    }
	    
	    var config = BBX.config;
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
		    __getToken();			    
		}
	    });
	    
	    var __getToken = function() {
		var config = BBX.config,
		    url = config.apiUrl + "/" + config.MYREPOSITORY + "/" + config.MYMUCUA + "/mocambola/login",
		    mocambola = new MocambolaModel([], {url: url});
		
		// remove cookie if it exists
		if ($.cookie('csrftoken')) {
		    $.removeCookie('csrftoken');
		}		
		mocambola.fetch({});
	    };	    
	}
    })
    return RegisterView;
})	
