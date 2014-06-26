define([
    'jquery', 
    'underscore',
    'backbone',
    'jquery_cookie',
    'jquery_json',
    'modules/bbx/base-functions',
    'modules/repository/model',
    'modules/mucua/model',
    'modules/mucua/collection',
    'modules/mocambola/model',
    'json!config.json',
    'text!templates/auth/LoginTemplate.html',
], function($, _, Backbone, jQueryCookie, jQueryJson, BBXBaseFunctions, RepositoryModel, MucuaModel, MucuaCollection, MocambolaModel, Config, LoginTemplate){
    var LoginView = Backbone.View.extend({
	el: "body",
	
	events: {
	    "click .submit": "doLogin"
	    // TODO: get ENTER type on password field
	},
	
	__prepareLoginData: function() { 
	    // TODO: add form checks
	    var postData = {}
	    postData.username = $("#mocambola").val();
	    postData.repository = $("#repository").val();
	    postData.mucua = $("#mucua").val();
	    // TODO: encrypt password OR implement auth on django layer
	    // - https://github.com/RedeMocambos/baobaxia/issues/24
	    // while not solved, auth with no crypt
	    postData.password = $("#password").val().toString();
	    return postData;
	},
	
	__checkLogin: function(loginData) {
	    //TODO: fazer check_login na API
	    var mocambola = new MocambolaModel(loginData, 					       
					       {url: Config.apiUrl + '/' + loginData.repository + '/' + loginData.mucua + '/mocambola/login'});	    
	    
	    mocambola.save()
		.always(function(userData) {
		    if (userData.error === true) {
			$('#message-area').html(userData.errorMessage);
		    } else {
			$('#message-area').html('login bem sucedido!');
			$("body").data("bbx").userData = userData;
		    }
		});		
	},
	
	__getDefaultHome: function() {
	    // MAYBE, this should be a configurable field
	    var config = $("body").data("bbx"),
	    url = '#' + config.defaultRepository.name + '/' + myMucua;
	    return url;
	},
	
	doLogin: function() {
	    var loginData = this.__prepareLoginData(),
	    login = this.__checkLogin(loginData),
	    urlRedirect = BBXBaseFunctions.getDefaultHome();
	    userData = '';
	    
	    //timeout nessa parte de baixo
	    var loginOK = setInterval(function() {
		userData = $.toJSON($("body").data("bbx").userData);
		if (typeof userData !== 'undefined') {
		    // set cookie that expires in one day
		    $.cookie('sessionBBX', userData, { expires: 1});
		    $('body').data('bbx').userData = '';
		    // redirect
		    $('#content').html('');
		    window.location.href = urlRedirect;
		    clearInterval(loginOK);
		}
	    }, 50);
	},
	
	render: function(){
	    var __parseTemplate = function(data) {
		// parse header
		$('body').removeClass("").addClass("login");
		
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
		    var mucuas = new MucuaCollection([], {url: config.apiUrl + '/' + config.defaultRepository.name + '/mucuas'});
		    mucuas.fetch({
			success: function() {
			    var mucuasLength = mucuas.models.length,
			    mucuaList = [],
			    data = {};
			    $("body").data("bbx").config.mucuaList = [];
			    
			    for (var m = 0; m < mucuasLength; m++) {
				mucuaName = mucuas.models[m].attributes;
				mucuaList.push(mucuaName);
			    }
			    // set mucua list
			    $("body").data("bbx").config.mucuaList = mucuaList;
			    
			    data = {
				defaultRepository: config.defaultRepository,
				mucuaList: mucuaList,
				myMucua: config.myMucua,
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
		
		url = config.apiUrl + "/" + config.repository + "/" + config.mucua + "/mocambola/login";
		var mocambola = new MocambolaModel([], {url: url});
		mocambola.fetch({});
	    };
	}
    })

    return LoginView;
});