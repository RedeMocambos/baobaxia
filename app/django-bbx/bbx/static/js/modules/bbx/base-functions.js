/**
 * Baobaxia
 * 2014
 * 
 * bbx/base-functions.js
 *
 *  All functions of general use, intended to be accessed by modules of the interface; includes also some private functions. The list of public functions is declared at the end of the file.
 *
 */

define([
    'jquery', 
    'underscore',
    'backbone',
    'jquery_cookie',
    'views/common/HeaderView',
    'views/common/BuscadorView',
    'modules/mucua/model',
    'modules/repository/model',
    'modules/media/media-functions',
    'json!config.json',
    'text!templates/common/Content.html',
    'text!templates/common/Sidebar.html',
    'text!templates/common/UsageBar.html',
    'text!templates/common/UserProfile.html',
    'text!templates/common/MucuaProfile.html'
], function($, _, Backbone, jQueryCookie, HeaderView, BuscadorView, MucuaModel, RepositoryModel, MediaFunctions, DefaultConfig, ContentTpl, SidebarTpl, UsageBarTpl, UserProfileTpl, MucuaProfileTpl) {
    
    var init = function() {
	if (typeof $("body").data("bbx") === 'undefined') {
	    $("body").data("bbx", 
			   {
			       configLoaded: false
			   });
	}

var configLoaded = $("body").data("bbx").configLoaded;
	if (configLoaded === false) {
	    __setConfig(DefaultConfig);
	}
    }
    
    /**
     * checks if there's an opened session
     * 
     * @return {Bool} if there's a session opened
     */
    var isLogged = function() {
	if ($.cookie('sessionBBX')) {
	    // TODO: add some session check	   
	    return true;
	}
	return false;
    }
    
    /**
     * return home page
     *
     * @return {String} a url
     */
    var getDefaultHome = function() {
	// MAYBE, this should be a configurable field
	var config = $("body").data("bbx").config,
	url = '#' + config.MYREPOSITORY + '/' + config.MYMUCUA;
	return url;
    }
    
    /**
     * get avatar TODO
     * 
     * @return {String} a url
     */
    var getAvatar = function(username = '') {
	var username = '',
	avatarUrl = '',
	defaultAvatar = 'avatar-default.png';
	
	// TODO: implement avatar
	
	avatarUrl = "images/" + defaultAvatar;
	return avatarUrl;
    }
    
    /**
     * render common for internal pages at baobaxia
     *
     * @return [jQuery modify #header]
     */
    var renderCommon = function(name) {
	var data = {},
	config = $("body").data("bbx").config;
	
	$('body').removeClass().addClass(name);
	console.log('render common: ' + name);
	if ($('#sidebar').html() == "" ||
	    (typeof $('#sidebar').html() === "undefined")) {
	    data.config = config;
	    $('#footer').before(_.template(SidebarTpl, data));
	}
	    
	$('#content').html('');	
	var headerView = new HeaderView();
	headerView.render(data);
	
	var buscadorView = new BuscadorView();
	buscadorView.render({});
	
	// adiciona eventos comuns
	$('#caixa_busca').keyup(function(e) {
	    if (e.keyCode == 13) {
		MediaFunctions.doSearch();
	    } 
	});
    }
    
    /**
     * render usage bar at footer
     *
     * @return [jquery modify #footer]
     */
    var renderUsage = function(data) {
	var data = data || '',
	reStripUnit = /^([0-9\.]+)([\w]*)/,
	total = data.total.match(reStripUnit);
	used = data.used.match(reStripUnit);
	
	// split values from regexp
	data.total = total[1];
	data.totalUnit = total[2];
	data.used = used[1];
	data.usedUnit = used[2];
	
	// calculate the percentages
	data.usedPercent = Math.round(parseFloat(data.used) / parseFloat(data.total) * 100);
	data.demandedPercent = Math.round(parseFloat(data.demanded) / parseFloat(data.total) * 100);
	
	var compiledUsage = _.template(UsageBarTpl, data);
	$('#footer').html(compiledUsage);
    }

    /**
     *
     */
    var renderSidebar = function(pageType) {
	var page = page || '';
	console.log('render sidebar');
	if (this.isLogged() &&
	    ((typeof $("#user-profile").html() === "undefined") || $("#user-profile").html() == "")) {
	    var userProfile = $.parseJSON($.cookie('sessionBBX'));
	    userProfile.mocambolaUrl = this.getDefaultHome() + '/mocambola/' + userProfile.username
	    userProfile.avatar = this.getAvatar();
	    if ($('#link-login')) {
		$('#link-login').remove();
	    }
	    $('#user-profile').html(_.template(UserProfileTpl, userProfile));
	}
    }
    
    /**
     * get actual mucua
     *
     * @config {Object} input Object with config data
     * @return {None} don't return values
     */
    var __getMyMucua = function() {
	var config = $("body").data("bbx").config;
	if (typeof config.MYMUCUA === 'undefined') {
	    var myMucua = new MucuaModel([], {url: config.apiUrl + '/mucua/'});
	    myMucua.fetch({
		success: function() {		    
		    config.MYMUCUA = myMucua.attributes[0].description;
		}
	    });
	}
	return config.MYMUCUA;
    }
    
    /**
     * Get actual repository
     *
     * @config {Object} input Object with config data
     * @return {None} don't return values (only by jQuery)
     */
    var __getDefaultRepository = function() {
	var config = $("body").data("bbx").config;
	if (typeof config.MYREPOSITORY === 'undefined') {
	    var defaultRepository = new RepositoryModel([], {url: config.apiUrl + '/repository/'});
	    defaultRepository.fetch({
		success: function() {
		    config.MYREPOSITORY = defaultRepository.attributes[0]; 
		}
	    });
	}
	return config.MYREPOSITORY;
    }    
    
    /**
     * Get all available repositories
     *
     * @return {None} don't return values (only by jQuery)
     */
    var __getRepositories = function() {
	var config = $("body").data("bbx").config;
	
	// TODO: puxar lista real de repositorios
	//var listRepositories = new RepositoryModel([], {url: Config.apiUrl + '/repository/list'});
	config.repositoriesList = [{name: 'mocambos'}];  // hardcoded enquanto nao esta funcional
    }
    
    /**
     * Set configurations for the whole interface
     *
     * @config {Object} input Object with config data
     * @return {None} don't return values (only by jQuery)
     */
    var __setConfig = function(jsConfig) {
	// configuracoes padrao: config.json
	var jsConfig = jsConfig || '',
	config = jsConfig;
	$("body").data("bbx").config = jsConfig;
	
	__getMyMucua();
	__getDefaultRepository();
	__getRepositories();
	
	// so preenche quando todos tiverem carregado
	var loadData = setInterval(function() {
	    if (typeof config.MYMUCUA !== 'undefined' &&
		typeof config.MYREPOSITORY !== 'undefined' &&
		typeof config.repositoriesList !== 'undefined') {	
		console.log('configs loaded!');
		$("body").data("bbx").configLoaded = true;
		clearInterval(loadData);
	    }
	}, 50);	    
    }

    var setNavigationVars = function(repository, mucua, subroute='') {
	var subroute = subroute || '',
	reMedia = /^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}/,  // padrao de uuid
	reMocambola = /^[0-9a-zA-Z-_]*@[0-9a-zA-Z-_\.]*\.[a-zA-Z]{2,4}$/,
	reSearch = /search/,
	matchMedia = '',
	matchSearch = '',
	matchMocambola = '',
	config = $("body").data("bbx").config;	
	config.repository = repository;
	config.mucua = mucua;
	config.subroute = subroute;
	
	// ---------- /
	// solve problems / restrictions at navigation menu / replace inexistant routes between rede <-> mucua	
	// - rotas inexistentes
	matchMedia = subroute.match(reMedia);
	matchMocambola = subroute.match(reMocambola);
	if (!_.isNull(matchMedia) ||
	    !_.isNull(matchMocambola)) {
	    console.log('menu: rewrite route');
	    config.subroute = 'bbx/search';
	}
	// - rewrite url
	matchSearch = subroute.match(reSearch);
	if (!_.isNull(matchSearch)) {
	    if (!subroute.match(/bbx/)) {
		config.subroute = 'bbx/' + subroute;
	    }
	}
	
	// rede home
	if (mucua == 'rede' || config.subroute == '') {
	    config.subroute = 'bbx/search';
	}
	
	$("body").data("bbx").config = config;
    }

    // static format: day/month/year
    var formatDate = function(date) {
	console.log(date);
	if (date != '') {
	    var newDate = '',
	    re = /^(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)[\.0-9]*Z$/,
	    matches = date.match(re);
	    return matches[3] + '/' + matches[2] + '/' + matches[1];
	} else {
	    return false;
	}
    }
    
    return {
	init: init,
	isLogged: isLogged,
	getDefaultHome: getDefaultHome,
	getAvatar: getAvatar,
	renderCommon: renderCommon,
	renderUsage: renderUsage,
	renderSidebar: renderSidebar,
	setNavigationVars: setNavigationVars,
	formatDate: formatDate
    }
});
    