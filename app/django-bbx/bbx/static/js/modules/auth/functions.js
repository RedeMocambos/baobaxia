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
    'text!/templates/' + BBX.userLang + '/auth/LoginOk.html',
    'text!/templates/' + BBX.userLang + '/auth/LoginFailed.html',
    'text!/templates/' + BBX.userLang + '/auth/PasswordMustMatch.html',
    'text!/templates/' + BBX.userLang + '/auth/FillUser.html',
    'text!/templates/' + BBX.userLang + '/auth/FillPassword.html',
    'text!/templates/' + BBX.userLang + '/auth/UserExists.html',
], function($, _, Backbone, BBXFunctions, Config, MocambolaModel, LoginOkTpl, LoginFailedTpl, PasswordMustMatchTpl, FillUserTpl, FillPasswordTpl, UserExistsTpl){
    
    var init = function() {	
	AuthFunctions = this;
    }

    var __getConfig = function() {
	return BBX.config;
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
		    BBX.loginError = userData.errorMessage;
		} else {
		    $('#message-area').html(LoginOkTpl);
		    BBX.config.userData = userData;
		}
	    });		
    }
	
    var __getDefaultHome = function() {
	// MAYBE, this should be a configurable field
	var config = BBX.config,
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
			    'values': BBX.config.userData
			   }
	    if (typeof userData.values !== 'undefined') {
		// set cookie that expires in one day
		BBXFunctions.addToCookie(userData);
		BBX.config.userData = userData;
		
		// redirect
		$('#content').html('');
		window.location.href = urlRedirect;
		clearInterval(loginOK);
	    } else if (BBX.loginError) {
		console.log('login falhou');
		BBX.loginError = false;		    
		clearInterval(loginOK);
	    }
	}, 50);
    }

    var doLogout = function() {
	if ($.cookie('sessionBBX')) {
	    $.removeCookie('sessionBBX');
	}
	BBX.userData = undefined;
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
		    var message = UserExistsTpl;
		    $("#message-area").html(UserExistsTpl);
		} else {
		    // if not exists, continue and register the user
		    mocambola = new MocambolaModel(registerData, 					       
						   {url: Config.apiUrl + '/mocambola/register'});
		    mocambola.save()
			.always(function(userData) {
			    if (userData.error === true) {
				$('#message-area').html(UserCreationErrorTpl);				    
			    } else {
				BBX.config.userData = userData;
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
	    messageArray.push(PasswordMustMatchTpl);
	}
	if (postData.username === '') {
	    messageArray.push(FillUserTpl);
	}
	if (postData.password === '') {
	    messageArray.push(FillPasswordTpl);
	}
	
	if (!_.isEmpty(messageArray)) {
	    _.each(messageArray, function(message) {
		$("#message-area").append(message);
	    });
	    return false;
	} else {
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

