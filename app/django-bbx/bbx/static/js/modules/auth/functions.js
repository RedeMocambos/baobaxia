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
    'modules/mocambola/model',
    'text!templates/' + BBX.userLang + '/auth/LoginOk.html',
    'text!templates/' + BBX.userLang + '/auth/LoginFailed.html',
    'text!templates/' + BBX.userLang + '/auth/PasswordMustMatch.html',
    'text!templates/' + BBX.userLang + '/auth/FillUser.html',
    'text!templates/' + BBX.userLang + '/auth/FillPassword.html',
    'text!templates/' + BBX.userLang + '/auth/UserExists.html',
    'text!templates/' + BBX.userLang + '/auth/UserCreationError.html',
], function($, _, Backbone, BBXFunctions, MocambolaModel, LoginOkTpl, LoginFailedTpl, PasswordMustMatchTpl, FillUserTpl, FillPasswordTpl, UserExistsTpl, UserCreationErrorTpl){
    
    /**
     * Inicializa library
     *
     * @returns {None}
     */    
    var init = function() {	
	AuthFunctions = this;
    }

    /**
     * Retorna url redirect padrão
     *
     * @returns {None} [Conteúdo definido pelo jquery]
     */
    var __getDefaultHome = function() {
	// MAYBE, this should be a configurable field
	var config = BBX.config,
	    url = '#' + config.MYREPOSITORY + '/' + config.MYMUCUA;

	console.log('__getDefaultHome');
	
	return url;
    }

    var __registerLogin = function(userData) {
	
    }
    
    /**
     * Dá saída de mensagem de restultados
     *
     * @returns {None} [Conteúdo definido pelo jquery]
     */        
    var __checkLogin = function() { 
	// TODO: add form checks
	var postData = {},
	    verifyLoginURL = '';

	console.log('__checkLogin');
	
	postData.username = $("#mocambola").val();
	postData.repository = $("#repository").val();
	postData.mucua = $("#mucua").val();
	// TODO: encrypt password OR implement auth on django layer
	// - https://github.com/RedeMocambos/baobaxia/issues/24
	// while not solved, auth with no crypt
	postData.password = $("#password").val().toString();
	
	var loginUser =  postData.username + "@" + postData.mucua + "." + postData.repository + '.net';
	verifyLoginURL = BBX.config.apiUrl + '/' + postData.repository + '/' + postData.mucua + '/mocambola/login';
	
	// check login at 	
	$.post(verifyLoginURL, postData)
	    .always(function(data) {
		if (data.error === true) {
		    // unauthorized
		    $('#message-area').html(data.errorMessage);
		    BBX.loginError = data.errorMessage;
		    sessionStorage.error = data.errorMessage;
		} else {
		    // authorized
		    delete sessionStorage.error;
		    
		    if (typeof data === 'string') {
			data = JSON.parse(data);
		    } else {
			$('#message-area').html(LoginFailedTpl);
			return false;
		    }
		    $('#message-area').html(LoginOkTpl);
		    var userData = {'username': data.username }
		    
		    BBX.config.userData = userData;  // TODO: checar se precisa redundar as variaveis
		    localStorage.userData = JSON.stringify(userData);
		    
		    // set token
                    sessionStorage.token = data.token;
		}		
	    });
    }

    /**
     * Verifica se usuário já existe
     * // used by register to verify if user exists    
     *
     * @params {Object} registerData dados de registro de usuário
     * @returns {None} [Conteúdo definido pelo jquery]
     */
    var __verifyUserExists = function(registerData) {
	var mocambola = null,
	    registerData = registerData || null;
	
	console.log('__verifyUserExists');
	
	if (_.isNull(registerData)) {
	    return false;
	}

	// try to get user
	mocambola = new MocambolaModel(registerData, 					       
				       {url: BBX.config.apiUrl + '/' + registerData.repository + '/' + registerData.mucua + '/mocambola/' + registerData.email});
	mocambola.fetch({
	    success: function() {
		// se retorna erro de usuario nao encontrado, segue. Registra usuario.
		// busca usuarios. Se retorna usuario, ele ja existe. Avisa erro de usuario existe.
		if (mocambola.attributes.error === true) {
		    // if not exists, continue and register the user
		    mocambola = new MocambolaModel(registerData, 					       
						   {url: BBX.config.apiUrl + '/mocambola/register'});
		    mocambola.save()
			.always(function(userData) {
			    if (typeof userData.error !== 'undefined') {
				$('#message-area').html(UserCreationErrorTpl);				    
			    } else {
				BBX.config.userData = userData;  // TODO: checar se precisa redundar as variaveis
				localStorage.userData = JSON.stringify(userData);
				doLogin(userData);
			    }
			})		
		} else {
		    var message = UserExistsTpl;
		    $("#message-area").html(UserExistsTpl);
		}
	    }
	});
    }


    /**
     * Tenta fazer login
     *
     * @params {Object} loginData dados de registro de usuário
     * @returns {None} [Conteúdo definido pelo jquery]
     */
    var doLogin = function(loginData) {
	var userData,
	loginData = loginData || '',
	urlRedirect = '',
	defaultUrlRedirect = BBXFunctions.getDefaultHome();
	
	console.log('doLogin');
	if (loginData === ''  || typeof sessionStorage.token === 'undefined') {
	    loginData = __checkLogin();
	}
	
	if (typeof localStorage.redirect_url === 'undefined') {
	    urlRedirect = defaultUrlRedirect;
	} else {
	    urlRedirect = localStorage.getItem('redirect_url');
	}
	
	//timeout nessa parte de baixo
	var loginOK = setInterval(function() {
	    if (typeof localStorage.userData !== 'undefined') {
		var userData = JSON.parse(localStorage.userData);
		
		if (typeof userData.username !== 'undefined') {
		    // redirect
		    //$('#content').html('');
		    window.location.href = urlRedirect;
		    clearInterval(loginOK);
		} else if (typeof sessionStorage.loginError !== 'undefined') {
		    BBX.loginError = false;
		    $('#message-area').html('login error! </\>');
		    clearInterval(loginOK);
		}	
	    }
	}, 50);
    }

    var doLogout = function() {
	console.log('doLogout');
	
	delete BBX.userData;
	BBX.tmp = {};
	localStorage.clear();
	sessionStorage.clear();
	$('#header').html('');
	$('#content').html('');
	$('#sidebar').detach();
	$('#footer').html('');
    }
    
    var doRegister = function() {
	var postData = {},
	    messageArray = [];
	console.log('doRegister');
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
	    // verifica usuario e tenta registrar
	    __verifyUserExists(postData);
	}
    }
	
    return {
	init: init,
	doLogin: doLogin,
	doLogout: doLogout,
	doRegister: doRegister
    }
});

