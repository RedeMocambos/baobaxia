define([
    'jquery', 
    'lodash',
    'backbone',
    'modules/auth/functions',
    'modules/mucua/model',
    'modules/mucua/collection',
    'modules/mocambola/model',
    'views/auth/LoginView'
], function($, _, Backbone, AuthFunctions, MucuaModel, MucuaCollection, MocambolaModel, LoginView){
    var RegisterView = Backbone.View.extend({
	el: "body",
	
	events: {
	    "click .submit-register": "doRegister",
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
		BBXFunctions.getTemplateManager('/templates/' + BBX.userLang + '/auth/Register', function(RegisterTpl) {
		    var compiledContent = _.template(RegisterTpl, data);
		    $('#content').html(compiledContent);
		});
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
		    // TODO: substituir por TOKEN auth
		}
	    });
	}
    })
    return RegisterView;
})	
