/**
 * Baobaxia
 * 2014
 * 
 * bbx/functions.js
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
    'views/mucua/HomeMucua',
    'views/common/BuscadorView',
    'modules/mucua/model',
    'modules/repository/model',
    'modules/media/functions',
    'json!config.json',
    'text!templates/common/Content.html',
    'text!templates/common/Sidebar.html',
    'text!templates/common/UsageBar.html',
    'text!templates/common/UserProfile.html',
    'text!templates/common/MucuaProfile.html'
], function($, _, Backbone, jQueryCookie, HeaderView, HomeMucuaView, BuscadorView, MucuaModel, RepositoryModel, MediaFunctions, DefaultConfig, ContentTpl, SidebarTpl, UsageBarTpl, UserProfileTpl, MucuaProfileTpl) {
    
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
	BBXFunctions = this;
    }
    
    /**
     * checks if there's an opened session
     * 
     * @return {Bool} if there's a session opened
     */
    var isLogged = function() {
	if (this.getFromCookie('userData')) {
	    // TODO: add some session check	   
	    return true;
	} else { 
	    return false;
	}
    }

    /**
     * adds value to cookie
     *
     * @data {Object} input Object with data to be added (with the structure: {'name': 'nameOfProperty', 'values': {Object})
     * @return {Obj} return the complete new object
     */
    var addToCookie = function(data) {
	var cookieData = {},
	serializedCookie = '',
	cookie = null;
	
	console.log('addToCookie()');
	if ($.cookie('sessionBBX')) {
	    cookieData = $.parseJSON($.cookie('sessionBBX'));	    
	}
	cookieData[data.name] = data.values;
	serializedCookie = $.toJSON(cookieData);
	
	$.cookie('sessionBBX', null);
	$.cookie('sessionBBX', serializedCookie);
	var cookie = $.parseJSON($.cookie('sessionBBX'));
	return cookieData;
    }

    /**
     * get value from a cookie or the whole cookie
     *
     * @data {String} input String with the key or wildchar
     * @return {Obj} return the selected value from the cookie
     */
    var getFromCookie = function(key) {
	var key = key || '*';
	if ($.cookie('sessionBBX')) {
	    var cookieData = $.parseJSON($.cookie('sessionBBX'));
	    if (key == '*') {
		return cookieData;
	    } else { 
		if (_.has(cookieData, key)) {
		    return cookieData[key];
		} else {
		    // key don't exists
		    return false;
		}
	    }
	} else {
	    // error / not logged in
	    return false;
	}
    }
    
    /**
     * return home page
     *
     * @return {String} a url
     */
    var getDefaultHome = function() {
	// MAYBE, this should be a configurable field
	var config = $("body").data("bbx").config,
	url = '#' + config.MYREPOSITORY + '/' + config.MYMUCUA + '/bbx/search';
	return url;
    }
    
    /**
     * get avatar TODO
     * 
     * @return {String} a url
     */
    var getAvatar = function(username) {
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
	data.config = config;
	
	$('body').removeClass().addClass(name);
	if (config.mucua == config.MYMUCUA) {
	    $('body').addClass('my-mucua');
	} else {
	    $('body').addClass('other-mucua');
	}
	data.lastVisitedMucuas = __getLastVisitedMucuas(config);
	console.log('render common: ' + name);
	if ($('#sidebar').html() == "" ||
	    (typeof $('#sidebar').html() === "undefined")) {
	    $('#footer').before(_.template(SidebarTpl, data));
	}
	
	$('#content').html('');	
	var headerView = new HeaderView();
	if (isLogged) {
	    // get cookie data if has visit any mucuas
	    // 
	}
	
	headerView.render(data);
	
	var buscadorView = new BuscadorView();
	buscadorView.render({});
    }


    /**
     * render usage bar at footer
     *
     * @return [jquery modify #footer]
     */
    var renderUsage = function() {
	console.log('render usage');
	
	// verifica se ja foi carregado o usage. 
	if ($('#footer').html() === "") {
	    // se ja foi carregado sai da funcao	    
	    if ($('#usage-bar').length !== 0) {
		return false;
	    }
	    
	    // verifica se existe dado da mucua
	    // - se não existe, pega os dados da mucua do config (mymucua)
	    // - se existe, verifica se foi carregado o uuid
	    //    - chama renderizacao dos dados
	    // - se existe, chama renderizacao dos dados
	    
	    // mucua not loaded
	    var loadMucua = null;
	    if (typeof BBX.mucua === 'undefined') {
		loadMucua = true;
	    } else if (_.isObject(BBX.mucua)) {
		if (typeof BBX.mucua.uuid === 'undefined') {		    
		    loadMucua = true;
		} else {
		    loadMucua = false;
		}
	    }
	    
	    if (loadMucua === true) {
		// load mucua
		var config = $("body").data("bbx").config,
		mucua = new MucuaModel([], {url: config.apiUrl + '/mucua/by_name/' + config.MYMUCUA});
		mucua.fetch({
		    success: function() {
			var mucuaData = {
			    mucua: mucua.attributes
			};
			BBX.mucua = mucuaData.mucua;
			// parse usage
			__parseMucuaUsage(mucuaData.mucua);
		    }
		});		
	    } else {
		__parseMucuaUsage(BBX.mucua.uuid);
	    }
	}
    }
    
    var __getMucuaResources = function(uuid) {
	var config = $("body").data("bbx").config,
	url = config.apiUrl + '/mucua/' + uuid + '/info',
	mucua = '';
	
	mucua = new MucuaModel([], {url: url});
	mucua.fetch({
	    success: function() {
		console.log('success');
		BBX.mucua.info = mucua.attributes;
	    }
	});
    }
    
    var __parseMucuaUsage = function(mucua) {
	if (!_.isObject(mucua)) {
	    return false;
	}	
	if (typeof mucua.uuid === 'undefined' ||
	    mucua.uuid === '') { 
	    return false;
	}
	
	__getMucuaResources(mucua.uuid);
	var mucuaResourcesLoad = setInterval(function() {
	    if (typeof BBX.mucua.info !== 'undefined') {
		var mucua = {},
		reStripUnit = /^([0-9\.]+)([\w]*)/,
		total = '',
		usedByOther = '',
		usedByAnnex = '',
		mucuaDOM = BBX.mucua;
		
		mucua.totalDiskSpace = mucuaDOM.info['total disk space'];
		mucua.usedByAnnex = mucuaDOM.info['local annex size'];
		mucua.usedByOther = mucuaDOM.info['local used by other'];
		mucua.availableLocalDiskSpace = mucuaDOM.info['available local disk space'];
		mucua.demanded = 0; // TODO: dynamic var
		
		BBXFunctions.renderUsage(mucua);
		
		total = mucua.totalDiskSpace.match(reStripUnit);
		usedByOther = mucua.usedByOther.match(reStripUnit);
		usedByAnnex = mucua.usedByAnnex.match(reStripUnit);
		
		// split values from regexp
		mucua.total = total[1];
		mucua.totalUnit = total[2];
		mucua.usedByOther = usedByOther[1];
		mucua.usedByOtherUnit = usedByOther[2];
		mucua.usedByAnnex = usedByAnnex[1];
		mucua.usedByAnnexUnit = usedByAnnex[2];
		
		// calculate the percentages
		mucua.usedByOtherPercent = parseFloat(parseFloat(mucua.usedByOther) / parseFloat(mucua.total) * 100).toFixed(1);
		mucua.usedByAnnexPercent = parseFloat(parseFloat(mucua.usedByAnnex) / parseFloat(mucua.total) * 100).toFixed(1);
		mucua.availableLocalDiskSpacePercent = parseFloat(parseFloat(mucua.availableLocalDiskSpace) / parseFloat(mucua.total) * 100).toFixed(1);
		mucua.demandedPercent = parseFloat(parseFloat(mucua.demanded) / parseFloat(mucua.total) * 100).toFixed(1);
		
		var compiledUsage = _.template(UsageBarTpl, mucua);
		$('#footer').html(compiledUsage);
		clearInterval(mucuaResourcesLoad);
	    }
	}, 50);	
    }

    
    /**
     *
     */
    var renderSidebar = function(pageType) {
	var page = page || '',
	config = $("body").data("bbx").config;
	
	console.log('render sidebar');
	if (this.isLogged() &&
	    ((typeof $("#user-profile").html() === "undefined") || $("#user-profile").html() == "")) {
	    var userData = this.getFromCookie('userData');
	    userData.mocambolaUrl = '#' + config.MYREPOSITORY + '/' + config.MYMUCUA + '/mocambola/' + userData.username
	    userData.avatar = this.getAvatar();
	    if ($('#link-login')) {
		$('#link-login').remove();
	    }
	    $('#user-profile').html(_.template(UserProfileTpl, userData));
	}
	
	// if accessing the 'rede' tab
	if (config.mucua === 'rede' || config.mucua === '') {
	    var mucuaData = {
		mucua: {
		    // FAKE DATA
		    // TODO: get from API
		    note: 'REDE',
		    image: '/images/rede.png',
		    description: '',
		    note: config.repository,
		    url: '#' + config.repository,
		    storageSize: '100GB', 
		},
	    }
	    BBX.mucua = mucuaData.mucua;
	    mucuaData.config = config;
	    $('#place-profile').html(_.template(MucuaProfileTpl, mucuaData))
	} else {
	    var loadNewMucua = false;	    
	    // check if mucua has already been loaded
	    if (typeof BBX.mucua === 'undefined') {
		loadNewMucua = true;
	    } else if (BBX.mucua) {
		if (BBX.mucua.description !== config.mucua) {
		    loadNewMucua = true;
		}		    
	    }
	    
	    if (loadNewMucua) {		
		var mucua = new MucuaModel([], {url: config.apiUrl + '/mucua/by_name/' + config.mucua});
		mucua.fetch({
		    success: function() {
			var mucuaData = {
			    mucua: mucua.attributes
			};
			
			// check if that mucua has an image
			var urlMucuaImage = config.apiUrl + '/' + config.MYREPOSITORY + '/' + mucuaData.mucua.description + '/bbx/search/' + mucuaData.mucua.uuid;
			var mucuaImageSrc = mucua.getImage(urlMucuaImage, function(imageSrc){
			    $('#mucua_image').attr('src', imageSrc);
			});
			
			// FAKE DATA
			mucuaData.mucua.url = ''; // TODO: get from API
			mucuaData.mucua.storageSize = '10GB'; // TODO: get from API
			
			BBX.mucua = mucuaData.mucua;
			console.log('loaded mucua');
			mucuaData.config = config;
			
			$('#place-profile').html(_.template(MucuaProfileTpl, mucuaData))
			
		    }
		});	
	    }
	}
    }
    
    var __getLastVisitedMucuas = function(config) {
	// get last visited mucuas

	var visitedMucuas = {'name': 'visitedMucuas', 
			     'values': []
			    }
	visitedMucuas.values = getFromCookie('visitedMucuas') || [];
	
	// se for mymucua, nao adiciona a navegacao
	if (config.mucua == config.MYMUCUA || config.mucua == 'rede') {
	    return visitedMucuas.values;
	}
	
	var arrNavMucuas = visitedMucuas.values;
	
	if (_.isEmpty(arrNavMucuas)) {
	    // nao foi navegada ainda
	    
	    // adiciona ao comeco
	    visitedMucuas.values.unshift(config.mucua);
	} else {
	    // sim, ja existe navegacao
	    
	    // existe o termo?	    
	    var indexMucua = _.indexOf(arrNavMucuas, config.mucua);
	    
	    if (indexMucua == -1) { 
		// nao existe, adiciona ao comeco
		visitedMucuas.values.unshift(config.mucua);
	    } else if (indexMucua == 0) {
  		// existe, e é o primeiro (ultima mucua visitada)
		// nao faz nada
	    } else {
		// existe, em outra posicao. Tem que ir para o comeco
		// procura existente, exclui
		visitedMucuas.values.splice(indexMucua, 1);
		
		// adiciona ao comeco
		console.log('adiciona ao comeco');
	    }	    
	}
	
	addToCookie(visitedMucuas);
	
	return visitedMucuas.values;
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
		BBX.config = config;
		
		clearInterval(loadData);
	    }
	}, 50);	    
    }

    var setNavigationVars = function(repository, mucua, subroute) {
	var subroute = subroute || '',
	reMedia = /^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}/,  // padrao de uuid
	reMocambola = /^[0-9a-zA-Z-_]*@[0-9a-zA-Z-_\.]*\.[a-zA-Z]{2,4}$/,
	reSearch = /search/,
	matchMedia = '',
	matchSearch = '',
	matchMocambola = '',
	config = $("body").data("bbx").config,
	currentPage = Backbone.history.location.href;
	
	config.repository = repository;
	config.mucua = mucua;
	config.subroute = subroute;
	
	// adds current url to redirect
	if (!currentPage.match('login')) {
	    addToCookie({
		'name': 'redirect_url',
		'values': {
		    0: Backbone.history.location.href
		}
	    });
	}

	console.log('subroute: ' + config.subroute);
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
	
	// 
	if (config.subroute == '') {
	    config.subroute = 'bbx/search';
	}
	
	$("body").data("bbx").config = config;
    }

    // static format: day/month/year
    var formatDate = function(date) {
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
	getFromCookie: getFromCookie,
	addToCookie: addToCookie,
	getDefaultHome: getDefaultHome,
	getAvatar: getAvatar,
	renderCommon: renderCommon,
	renderUsage: renderUsage,
	renderSidebar: renderSidebar,
	setNavigationVars: setNavigationVars,
	formatDate: formatDate
    }
});
    
