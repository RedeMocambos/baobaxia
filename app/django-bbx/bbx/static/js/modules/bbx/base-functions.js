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
    'text!templates/common/content.html',
    'text!templates/common/sidebar.html',
    'text!templates/common/usage-bar.html',
    'text!templates/common/user-profile.html',
    'text!templates/common/mucua-profile.html'
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
	url = '#' + config.defaultRepository.name + '/' + config.myMucua;
	return url;
    }
    
    /**
     * get avatar
     * 
     * @return {String} a url
     */
    var getAvatar = function() {
	var avatarUrl = "",
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
	var data = {};
	$('body').removeClass().addClass(name);
	console.log('render common');
	
	if ($('#sidebar').html() == "" ||
	    (typeof $('#sidebar').html() === "undefined")) {
	    $('#footer').before(_.template(SidebarTpl));
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
	
	if (this.isLogged() &&
	    ((typeof $("#user-profile").html() === "undefined") || $("#user-profile").html() == "")) {
	    var userProfile = $.parseJSON($.cookie('sessionBBX'));
	    userProfile.mocambolaUrl = this.getDefaultHome() + '/mocambola/' + userProfile.username
	    userProfile.avatar = this.getAvatar();
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
	var myMucua = new MucuaModel([], {url: config.apiUrl + '/mucua/'});
	myMucua.fetch({
	    success: function() {		    
		config.myMucua = myMucua.attributes[0].description;
	    }
	});
    }
    
    /**
     * Get actual repository
     *
     * @config {Object} input Object with config data
     * @return {None} don't return values (only by jQuery)
     */
    var __getDefaultRepository = function() {
	var config = $("body").data("bbx").config;
	
	var defaultRepository = new RepositoryModel([], {url: config.apiUrl + '/repository/'});
	defaultRepository.fetch({
	    success: function() {
		config.defaultRepository = defaultRepository.attributes[0]; 
	    }
	});
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
	    if (typeof config.myMucua !== 'undefined' &&
		typeof config.defaultRepository !== 'undefined' &&
		typeof config.repositoriesList !== 'undefined') {	
		console.log('configs loaded!');
		$("body").data("bbx").configLoaded = true;
		clearInterval(loadData);
	    }
	}, 50);	    
    }
    
    return {
	init: init,
	isLogged: isLogged,
	getDefaultHome: getDefaultHome,
	getAvatar: getAvatar,
	renderCommon: renderCommon,
	renderUsage: renderUsage,
	renderSidebar: renderSidebar
    }
});
    