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
    'modules/common/HeaderView',
    'modules/mucua/model',
    'modules/repository/model',
    'json!config.json',
    'text!templates/common/content.html',
    'text!templates/common/sidebar.html',
    'text!templates/common/UsageBar.html'
], function($, _, Backbone, jQueryCookie, HeaderView, MucuaModel, RepositoryModel, DefaultConfig, ContentTpl, SidebarTpl, UsageBarTpl){
    
    var init = function() {
	if (typeof $("body").data("bbx") === 'undefined') {
	    $("body").data("bbx", 
			   {
			       configLoaded: false
			   });
	}
	
	configLoaded = $("body").data("bbx").configLoaded;
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
	var config = $("body").data("bbx");
	var url = '#' + config.defaultRepository.name + '/' + config.myMucua;
	return url;
    }
    
    /**
     * get avatar
     * 
     * @return {String} a url
     */
    var getAvatar = function() {
	var avatarUrl = "",
	defaultAvatar = 'default-avatar.png';
	
	// TODO: implement avatar
	
	avatarUrl = "images/" + defaultAvatar;
	return avatarUrl;
    }
    
    /**
     * render common for internal pages at baobaxia
     *
     * @return [jQuery modify #header]
     */
    var renderCommon = function() {
	data = $("body").data("bbx");
	console.log('render common');
	if ($('body').hasClass('login') || $('#content').html() == '') {
	    $('body').removeClass("login");
	    $('#content').html(_.template(ContentTpl));
	    $('#footer').before(_.template(SidebarTpl));
	}
	
	var headerView = new HeaderView();
	headerView.render(data);
    }

    /**
     * render usage bar at footer
     *
     * @return [jquery modify #footer]
     */
    var renderUsage = function(data) {
	if (_.isObject(data)) {
	    data.usedPercent = Math.round(data.used / data.total * 100);
	    data.demandedPercent = Math.round(data.demanded / data.total * 100);
	    
	    compiledUsage = _.template(UsageBarTpl, data);
	    $('#footer').html(compiledUsage);
	}
    }
    
    /**
     * get actual mucua
     *
     * @config {Object} input Object with config data
     * @return {None} don't return values
     */
    var __getMyMucua = function(config) {
	var myMucua = new MucuaModel([], {url: config.apiUrl + '/mucua/'});
	myMucua.fetch({
	    success: function() {		    
		$("body").data("bbx").myMucua = myMucua.attributes[0].description;
	    }
	});
    }
    
    /**
     * Get actual repository
     *
     * @config {Object} input Object with config data
     * @return {None} don't return values (only by jQuery)
     */
    var __getDefaultRepository = function(config) {
	var defaultRepository = new RepositoryModel([], {url: config.apiUrl + '/repository/'});
	defaultRepository.fetch({
	    success: function() {
		$("body").data("bbx").defaultRepository = defaultRepository.attributes[0]; 
	    }
	});
    }    
    
    /**
     * Get all available repositories
     *
     * @return {None} don't return values (only by jQuery)
     */
    var __getRepositories = function() {
	// TODO: puxar lista real de repositorios
	//var listRepositories = new RepositoryModel([], {url: Config.apiUrl + '/repository/list'});
	$("body").data("bbx").repositoriesList = [{name: 'mocambos'}];  // hardcoded enquanto nao esta funcional
    }
    
    /**
     * Set configurations for the whole interface
     *
     * @config {Object} input Object with config data
     * @return {None} don't return values (only by jQuery)
     */
    var __setConfig = function(config) {
	// configuracoes padrao: config.json
	
	var config = config || '',	
	bbxData = $("body").data("bbx");
	
	__getMyMucua(config);
	__getDefaultRepository(config);
	__getRepositories(config);
	
	// so preenche quando todos tiverem carregado
	var loadData = setInterval(function() {
	    if (typeof bbxData.myMucua !== 'undefined' &&
		typeof bbxData.defaultRepository !== 'undefined' &&
		typeof bbxData.repositoriesList !== 'undefined') {		 
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
	renderUsage: renderUsage
    }
});
    