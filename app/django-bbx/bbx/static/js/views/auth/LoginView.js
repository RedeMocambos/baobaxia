define([
    'jquery', 
    'lodash',
    'backbone',
    'jquery_cookie',
    'jquery_json',
    'modules/auth/functions',
    'modules/bbx/functions',
    'modules/repository/model',
    'modules/mucua/model',
    'modules/mucua/collection',
    'modules/mocambola/model',
    'json!config.json',
    'text!/templates/' + BBX.userLang + '/auth/LoginTemplate.html',
    'text!/templates/' + BBX.userLang + '/common/HeaderHome.html',
], function($, _, Backbone, jQueryCookie, jQueryJson, AuthFunctions, BBXFunctions, RepositoryModel, MucuaModel, MucuaCollection, MocambolaModel, Config, LoginTemplate, HeaderHomeTpl){
    var LoginView = Backbone.View.extend({
	el: "body",
	
	events: {
	    "click .submit": "doLogin",
	    "keyup #password": "__checkKeyPress"
	    // TODO: get ENTER type on password field
	},
	
	// problema: eventos duplicados atrapalham qdo carrega de novo!
	//	    this.delegateEvents(".submit", "click", "doLogin");
	
	__checkKeyPress: function(e) {
	    if (e.keyCode == 13) {
		this.doLogin();
	    } 
	},

	doLogin: function() {
	    AuthFunctions.doLogin();
	},
	
	render: function(){
	    var __parseTemplate = function(data) {
		$('#header').html(_.template(HeaderHomeTpl));
		
		// clean sidebar
		$('#sidebar').remove();
		
		// parse header
		$('body').removeClass().addClass("home login");
		
		// parse content
		var compiledContent = _.template(LoginTemplate, data);
		$('#content').html(compiledContent);
	    }
	    
	    var loadedData = setInterval(function() {
		var configLoaded = $("body").data("bbx").configLoaded,
		config = $("body").data("bbx").config;		
		
		// when all configs are loaded, load mucuas
		if (configLoaded) {
		    // get mucuas 
		    var mucuas = new MucuaCollection([], {url: config.apiUrl + '/' + config.MYREPOSITORY + '/mucuas'});
		    mucuas.fetch({
			success: function() {
			    var mucuasLength = mucuas.models.length,
			    mucuaList = [],
			    data = {};
			    $("body").data("bbx").config.mucuaList = [];
			    
			    for (var m = 0; m < mucuasLength; m++) {
				var mucuaName = mucuas.models[m].attributes;
				mucuaList.push(mucuaName);
			    }
			    // set mucua list
			    $("body").data("bbx").config.mucuaList = mucuaList;
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
		    
		    clearInterval(loadedData);
		}
	    }, 50);
	    
	    var __getToken = function() {
		var config = $("body").data("bbx").config;
		// remove cookie if it exists
		if ($.cookie('csrftoken')) {
		    $.removeCookie('csrftoken');
		}
		url = config.apiUrl + "/" + config.MYREPOSITORY + "/" + config.MYMUCUA + "/mocambola/login";
		var mocambola = new MocambolaModel([], {url: url});
		mocambola.fetch({});
	    };
	}
    })

    return LoginView;
});
