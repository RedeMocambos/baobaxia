/**
 * Baobaxia
 * 2014
 * 
 * auth/functions.js
 *
 *  Auth related functions
 *
 */

define([
    'jquery', 
    'lodash',
    'backbone',
    'modules/bbx/functions',
    'json!config.json',
    'modules/mocambola/model',
], function($, _, Backbone, BBXFunctions, Config, MocambolaModel){
    
    var init = function() {	
	AuthFunctions = this;
    }

    var __getConfig = function() {
	return $("body").data("bbx").config;
    }

    var __prepareLoginData = function() { 
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
    }
	
    var __checkLogin = function(loginData) {
	var url = Config.apiUrl + '/' + loginData.repository + '/' + loginData.mucua + '/mocambola/login';
	//TODO: fazer check_login na API
	var mocambola = new MocambolaModel(loginData, {url: url});
	
	mocambola.save()
	    .always(function(userData) {
		if (userData.error === true) {
		    $('#message-area').html(userData.errorMessage);
		    $("body").data("bbx").loginError = userData.errorMessage;
		} else {
		    $('#message-area').html('login bem sucedido!');
		    $("body").data("bbx").userData = userData;
		}
	    });		
    }
	
    var __getDefaultHome = function() {
	// MAYBE, this should be a configurable field
	var config = $("body").data("bbx"),
	url = '#' + config.MYREPOSITORY + '/' + config.MYMUCUA;
	return url;
    }

    var doLogin = function(loginData) {
	var userData,
	loginData = loginData || '',
	urlRedirect = '',
	defaultUrlRedirect = BBXFunctions.getDefaultHome();
	// Get from cookie
	
	if (loginData === '') {
	    loginData = __prepareLoginData();
	    __checkLogin(loginData);
	}
	
	if (typeof BBXFunctions.getFromCookie('redirect_url')[0] !== 'undefined') {
	    urlRedirect = BBXFunctions.getFromCookie('redirect_url')[0];
	} else {
	    urlRedirect = defaultUrlRedirect;
	}	
	//timeout nessa parte de baixo
	var loginOK = setInterval(function() {
	    var userData = {'name': 'userData',
			    'values': $("body").data("bbx").userData
			   }
	    
	    if (typeof userData.values !== 'undefined') {
		// set cookie that expires in one day
		BBXFunctions.addToCookie(userData);
		$('body').data('bbx').userData = '';
		
		// redirect
		$('#content').html('');
		window.location.href = urlRedirect;
		clearInterval(loginOK);
	    } else if ($("body").data("bbx").loginError) {
		console.log('login falhou');
		$("body").data("bbx").loginError = false;		    
		clearInterval(loginOK);
	    }
	}, 50);
    }

    var doLogout = function() {
	if ($.cookie('sessionBBX')) {
	    $.removeCookie('sessionBBX');
	}
	$("body").data("bbx").userData = undefined;
	$('#header').html('');
	$('#content').html('');
	$('#sidebar').detach();
	$('#footer').html('');
    }

    var __checkUser = function(registerData) {
	// verify if exists any user with that username
	var mocambola = new MocambolaModel(registerData, 					       
					   {url: Config.apiUrl + '/' + registerData.repository + '/' + registerData.mucua + '/mocambola/' + registerData.email});
	mocambola.fetch({
	    success: function() {
		// if user exists, raises error
		if (mocambola.attributes.error === false) {
		    var message = "Usuário já cadastrado!";
		    $("#message-area").html("<li>" + message + "</li>");
		} else {
		    // if not exists, continue and register the user
		    mocambola = new MocambolaModel(registerData, 					       
						   {url: Config.apiUrl + '/mocambola/register'});
		    mocambola.save()
			.always(function(userData) {
			    if (userData.error === true) {
				var message = "Erro ao criar usuário " + registerData.username;
				$('#message-area').html(userData.errorMessage);				    
			    } else {
				var message = "Usuário " + registerData.username + " criado com sucesso.";
				$("#message-area").html("<li>" + message + "</li>");

				$("body").data("bbx").userData = userData;
				console.log(userData);
				doLogin(userData);
			    }
			})		
		}
	    }
	});
    }

    var doRegister = function() {
	var postData = {},
	messageArray = [];
	postData.username = $("#mocambola").val() + '@' + $("#mucua").val() + '.' + $("#repository").val() + '.net';
	postData.repository = $("#repository").val();
	postData.mucua = $("#mucua").val();
	postData.email = $("#mocambola").val() + '@' + $("#mucua").val() + '.' + $("#repository").val() + '.net';
	postData.password = $("#password").val().toString();
	postData.password2 = $("#password2").val().toString();
	
	// data check
	if (postData.password !== postData.password2) {
	    messageArray.push("As senhas não conferem!");		
	}
	if (postData.username === '') {
	    messageArray.push("Preencha o usuário");
	}
	if (postData.password === '') {
	    messageArray.push("Preencha a senha");
	}
	
	if (!_.isEmpty(messageArray)) {
	    _.each(messageArray, function(message) {
		$("#message-area").append("<li>" + message + "</li>");
	    });
	    return false;
	} else {
	    $("#message-area").html("<li>processando formulário...</li>");
	    __checkUser(postData);		
	}
    }
	
    return {
	init: init,
	doLogin: doLogin,
	doLogout: doLogout,
	doRegister: doRegister
    }
});

