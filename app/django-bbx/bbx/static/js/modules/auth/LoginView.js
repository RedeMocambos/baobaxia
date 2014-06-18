define([
    'jquery', 
    'underscore',
    'backbone',
    'jquery_cookie',
    'modules/repository/model',
    'modules/mucua/model',
    'modules/mucua/collection',
    'modules/mocambola/model',
    'json!config.json',
    'text!templates/auth/LoginTemplate.html',
], function($, _, Backbone, jQueryCookie, RepositoryModel, MucuaModel, MucuaCollection, MocambolaModel, Config, LoginTemplate){
    var LoginView = Backbone.View.extend({
	el: "body",
	
	events: {
	    "click .submit": "doLogin"
	},
	
	__prepareLoginData: function() { 
	    // TODO: add form checks
	    var postData = {}
	    postData.username = $("#mocambola").val();
	    postData.repository = $("#repository").val();
	    postData.mucua = $("#mucua").val();
	    postData.csrfmiddlewaretoken = $("#csrfmiddlewaretoken").val();
	    postData.password = CryptoJS.SHA256($("#password").val()).toString();
	    return postData;
	},
	
	__checkLogin: function(loginData) {
	    //TODO: fazer check_login na API
	    var mocambola = new MocambolaModel(loginData, 					       
					       {url: Config.apiUrl + '/' + loginData.repository + '/' + loginData.mucua + '/mocambola/login'});	    
	    console.log(mocambola);
	    mocambola.save();
/*	    mocambola.fetch({
		success: function() {
		    // TODO: pegar dados ok da API
		    authorized = mocambola.models.attributes;
		    if (authorized) {
			userData = {
			    'auth': true,
			    'profile': {}
			};
		    } else {
			userData = {
			    'auth': false
			}
		    }
		    $("body").data("bbx").userData = userData;
		}
	    });
*/
	},

	doLogin: function() {
	    loginData = this.__prepareLoginData();
	    login = this.__checkLogin(loginData);
	    //timeout nessa parte de baixo
	    var loginOK = setInterval(function() {
		userData = $("body").data("bbx").userData;
		if (!_.isEmpty(userData)) {
		    // check
		}
	    });
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
		
		url = Config.apiUrl + "/" + data.repository + "/" + data.mucua + "/mocambola/login";
		var mocambola = new MocambolaModel([], {url: url});
		
		mocambola.fetch({
		    success: function() {
			var csrftoken = $.cookie('csrftoken');
			console.log(csrftoken);
			$('#csrfmiddlewaretoken').attr('value', csrftoken);
		    }
		});
	    };
	}
    })

    return LoginView;
});