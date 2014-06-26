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
	    login = this.__checkLogin(loginData);
	    var urlRedirect = BBXBaseFunctions.getDefaultHome();
	    //timeout nessa parte de baixo
	    var loginOK = setInterval(function() {
		userData = $.toJSON($("body").data("bbx").userData);
		if (typeof userData !== 'undefined') {
		    // set cookie that expires in one day
		    $.cookie('sessionBBX', userData, { expires: 1});
		    $('body').data('bbx').userData('');
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
		var configLoaded = $("body").data("bbx").configLoaded;
		
		// when all configs are loaded, load mucuas
		if (configLoaded) {
		    repository = $("body").data("bbx").defaultRepository;
		    myMucua = $("body").data("bbx").myMucua;
		    repositoriesList = $("body").data("bbx").repositoriesList;
		    
		    // get mucuas 
		    var mucuas = new MucuaCollection([], {url: Config.apiUrl + '/' + repository.name + '/mucuas'});
		    mucuas.fetch({
			success: function() {
			    var mucuasLength = mucuas.models.length,
			    mucuaList = [];
			    $("body").data("bbx").mucuaList = [];
			    
			    for (var m = 0; m < mucuasLength; m++) {
				mucuaName = mucuas.models[m].attributes;
				mucuaList.push(mucuaName);
		    }
			    $("body").data("bbx").mucuaList = mucuaList;
			    
			    data = {
				defaultRepository: repository,
				mucuaList: mucuaList,
				myMucua: myMucua,
				repositoryList: repositoriesList
			    }
			    __parseTemplate(data);			    
			    __getToken(
				{'repository': repository.name,
				 'mucua': myMucua
				}
			    );
			}
		    });
		    
		    clearInterval(loadedData);
		}
	    }, 50);

	    var __getToken = function(data) {
		// remove cookie if it exists
		if ($.cookie('csrftoken')) {
		    $.removeCookie('csrftoken');
		}
		
		url = Config.apiUrl + "/" + data.repository + "/" + data.mucua + "/mocambola/login";
		var mocambola = new MocambolaModel([], {url: url});
		mocambola.fetch({});
	    };
	}
    })

    return LoginView;
});