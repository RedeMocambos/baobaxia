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
    'lodash',
    'backbone',
    'jquery_cookie',
    'views/common/HeaderView',
    'views/mucua/HomeMucua',
    'views/common/BuscadorView',
    'modules/mucua/model',
    'modules/repository/model',
    'modules/tag/model',
    'modules/media/functions',
    'text!/templates/' + BBX.userLang + '/common/Content.html',
    'text!/templates/' + BBX.userLang + '/common/Sidebar.html',
    'text!/templates/' + BBX.userLang + '/common/MucuaItem.html',
    'text!/templates/' + BBX.userLang + '/common/UsageBar.html',
    'text!/templates/' + BBX.userLang + '/common/UserProfile.html',
    'text!/templates/' + BBX.userLang + '/common/MucuaProfile.html'
], function($, _, Backbone, jQueryCookie, HeaderView, HomeMucuaView, BuscadorView, MucuaModel, RepositoryModel, TagModel, MediaFunctions, ContentTpl, SidebarTpl, MucuaItemTpl, UsageBarTpl, UserProfileTpl, MucuaProfileTpl) {

    /**
     * init function of bbx functions
     *
     * @return {None}
     */    
    var init = function() {	
	__setConfig(BBX.config);
	BBX.tmp = {};
	BBXFunctions = this;
    }
    
    /**
     * checks if there's an opened session
     * 
     * @return {Bool} if there's a session opened
     */
    var isLogged = function() {
	if (getFromCookie('userData')) {
	    // TODO: add some session check	   
	    return true;
	} else { 
	    return false;
	}
    }

    /**
     * check if cookies are enabled
     *
     * @return {Bool} if cookies are enabled
     *
     */
    var isCookiesEnabled = function() {
	// TODO: improve cookie detection
	if (!navigator.cookieEnabled) {
	    console.log("Cookies not enabled, Baobaxia need cookies.");
	    return false;
	} else {
	    return true;
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

	if(!isCookiesEnabled) {
	    return false;
	}
	
	console.log('addToCookie()');
	if ($.cookie('sessionBBX')) {
	    cookieData = $.parseJSON($.cookie('sessionBBX'));
	}
	if (_.isNull(cookieData)) {
	    cookieData = {};
	}
	
	cookieData[data.name] = data.values
	
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
	
	if(!isCookiesEnabled()) {
	    return false;
	}
	
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
	var config = BBX.config,
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
     * render common elements for internal pages at baobaxia
     *
     * @el {String} HTML Element identifier
     * @return [jQuery modify #header]
     */
    var renderCommon = function(el) {
	var data = {},
	    config = BBX.config,
	    tags = [],
	    urlMucuas = config.apiUrl + '/' + config.repository + '/mucuas',
	    mucuas = new MucuaModel([], {url: urlMucuas});
	
	data.config = config;
	data.isLogged = this.isLogged;
	data.isEditable = false;
	
	$('body').removeClass().addClass(el);
	if (config.mucua == config.MYMUCUA) {
	    $('body').addClass('my-mucua');
	} else {
	    $('body').addClass('other-mucua');
	}
	data.lastVisitedMucuas = __getLastVisitedMucuas();
	console.log('render common: ' + el);
	if ($('#sidebar').html() == "" ||
	    (typeof $('#sidebar').html() === "undefined")) {
	    $('#footer').before(_.template(SidebarTpl, data));
	}
	
	// carregar lista de mucuas
	var toggleTabs = function(currentEl, el) {
	    _.each($('#header-tabs .button'), function(el) {
		var elName = el.id,
		    currentName = currentEl.currentTarget.id,
		    elBtn = '',
		    currentBtn = '';
		    
		elName = elName.split('btn-')[1];
		currentName = currentName.split('btn-')[1];
		
		elBtn = '#btn-' + elName;
		currentBtn = '#btn-' + elName;
		
		elName = '#' + elName  + '-container';
		currentName = '#' + currentName  + '-container';
		
		console.log(elName);
		console.log(currentName);
		if (elName === currentName) {
		    $(currentBtn).css('font-weight', 'bold');
		    $(currentName).show();
		} else {
		    $(elBtn).css('font-weight', '');
		    $(elName).hide();
		}
	    });
	}
	
	data.mucuas = [];

	if ($('#list-mucuas').html() === '') {
	    mucuas.fetch({
		success: function() {
		    var mucuaData = {
			config: config,
			mucuas: mucuas.attributes
		    }
		    $('#list-mucuas').append(_.template(MucuaItemTpl, mucuaData));
		    
		    $('#list-mucuas-container').hide();
		    $('#header-tabs #btn-cloud').css('font-weight', 'bold');
		    $('#header-tabs .button').on('click', function(el) {
			toggleTabs(el);
		    });
		}
	    });
	}
	///////
	
	
	$('#content').html('');

	tags = MediaFunctions.__getTagsFromUrl();
	BBX.tags = tags;
	
	if (tags.length > 0) {
	    data.isEditable = true;
	}
	
	var headerView = new HeaderView(data);
	if (isLogged) {
	    // get cookie data if has visit any mucuas
	}
	
	headerView.render(data);
	
	var buscadorView = new BuscadorView();
	buscadorView.render({});
    }


    /**
     * render usage bar at footer
     *
     * @return {None} [jquery modify #footer]
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
		var config = __getConfig(),
		mucua = new MucuaModel([], {url: config.apiUrl + '/mucua/by_name/' + config.MYMUCUA});
		mucua.fetch({
		    success: function() {
			var mucuaData = {
			    mucua: mucua.attributes
			};
			BBX.mucua = mucuaData.mucua;
			// parse usage
			//__getMucuaGroups(mucuaData.uuid);
			__parseMucuaUsage(mucuaData.mucua);
		    }
		});		
	    } else {
		__parseMucuaUsage(BBX.mucua);
	    }
	}
    }

    /**
     * get mucua groups at API
     * 
     * @uuid {String} Mucua UUID
     * @return {None}
     */
    var __getMucuaGroups = function(uuid) {
	var config = __getConfig(),
	    url = config.apiUrl + '/mucua/groups/' + uuid,
	    mucuaData = {};

	mucua = new MucuaModel([], {url: url});
	mucua.fetch({
	    success: function() {
		mucuaData.groups = mucua.attributes;
		// TODO: return mucua object to a specified target
	    }
	})
    }

    /**
     * get mucua territory at API
     * 
     * @uuid {String} Mucua UUID
     * @return {None}
     */
    var __getMucuaTerritory = function(uuid) {
	var config = __getConfig(),
	    url = config.apiUrl + '/mucua/territory/' + uuid,
	    mucuaData = {};

	mucua = new MucuaModel([], {url: url});
	mucua.fetch({
	    success: function() {
		mucuaData.groups = mucua.attributes;
		// TODO: return mucua object to a specified target
	    }
	})
    }
    
    /**
     * get mucua aditional data resources at API
     *
     * @uuid {String} Mucua UUID
     * @return {None} [jQuery modification]
     */    
    var __getMucuaResources = function(uuid) {
	var config = __getConfig(),
	    url = config.apiUrl + '/mucua/' + uuid + '/info',
	    mucua = {};
	
	mucua = new MucuaModel([], {url: url});
	mucua.fetch({
	    success: function() {
		var mucuaData = {},
		    reStripUnit = /^([0-9\.]+)([\w]*)/,
		    total = '',
		    usedByOther = '',
		    usedByAnnex = '',
		    usedByAnnexUnit = '',
		    networkSize = '';
		
		// set mucua info to global variable
		BBX.mucua.info = mucua.attributes;		
		
		// set mucua variables from API
		mucuaData.totalDiskSpace = String(BBX.mucua.info['total disk space'])
		mucuaData.usedByAnnex = String(BBX.mucua.info['local annex size']);
		mucuaData.usedByOther = String(BBX.mucua.info['local used by other']);
		mucuaData.availableLocalDiskSpace = String(BBX.mucua.info['available local disk space'])
		mucuaData.demanded = 0; // TODO: dynamic var
		
		total = mucuaData.totalDiskSpace.match(reStripUnit);
		// workaround to prevent error (not a bugfix!)
		if (_.isNull(total)) {
		    total = ['', 0, 0];
		}
		
		usedByOther = mucuaData.usedByOther.match(reStripUnit);
		// workaround to prevent error (not a bugfix!)
		if (_.isNull(usedByOther)) {
		    usedByOther = ['', 0, ''];
		}

		usedByAnnex = mucuaData.usedByAnnex.match(reStripUnit);
		// workaround to prevent error (not a bugfix!)
		if (_.isNull(usedByAnnex)) {
		    usedByAnnex = ['', 0, ''];
		}
		
		// split values from regexp
		mucuaData.total = total[1];
		mucuaData.totalUnit = total[2];
		mucuaData.usedByOther = usedByOther[1];
		mucuaData.usedByOtherUnit = usedByOther[2];
		mucuaData.usedByAnnex = usedByAnnex[1];
		mucuaData.usedByAnnexUnit = usedByAnnex[2];
		
		// calculate the percentages
		mucuaData.usedByOtherPercent = parseFloat(parseFloat(mucuaData.usedByOther) / parseFloat(mucuaData.total) * 100).toFixed(1);
		mucuaData.usedByAnnexPercent = parseFloat(parseFloat(mucuaData.usedByAnnex) / parseFloat(mucuaData.total) * 100).toFixed(1);
		mucuaData.availableLocalDiskSpacePercent = parseFloat(parseFloat(mucuaData.availableLocalDiskSpace) / parseFloat(mucuaData.total) * 100).toFixed(1);
		mucuaData.demandedPercent = parseFloat(parseFloat(mucuaData.demanded) / parseFloat(mucuaData.total) * 100).toFixed(1);

		// network data
		if (typeof BBX.network === 'undefined') {
		    var networkData = {
			mucua: {
			    note: 'rede',
			    image: '/images/rede.png',
			    description: 'rede',
			    note: config.repository,
			    url: '#' + config.repository
			},
		    }
		    BBX.network = networkData;
		}		
		
		// TODO: fix
		// workaround to prevent error (not a bugfix!)
		if (typeof mucua.attributes['network size'] === 'undefined') {
		    networkSize = 0;
		} else {
		    networkSize = mucua.attributes['network size'].match(reStripUnit)[1];
		}
		if (typeof BBX.network.info === 'undefined') {
		    BBX.network.info = { 
			'network_size': networkSize,
			'usedByAnnexUnit': mucuaData.usedByAnnexUnit
		    };
		}	
		BBX.mucua.info = mucuaData;
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
	if (typeof BBX.mucua.info === 'undefined') {	
	    __getMucuaResources(mucua.uuid);
	}
	var mucuaResourcesLoad = setInterval(function() {
	    if (typeof BBX.mucua.info !== 'undefined') {
		if (BBX.mucua.info.availableLocalDiskSpace !== 'undefined') {
		    var compiledUsage = _.template(UsageBarTpl, BBX.mucua.info);
		    $('#footer').html(compiledUsage);
		    clearInterval(mucuaResourcesLoad);
		}
	    }
	}, 100);	
    }
    
    /**
     * render elements at sidebar
     *
     * @return {None} [jQuery modification]
     */
    var renderSidebar = function() {
	var config = __getConfig(),
	    mucuaData = {},
	    loadMucua = false;
	
	console.log('render sidebar');
	if (isLogged() &&
	    ((typeof $("#user-profile").html() === "undefined") || $("#user-profile").html() == "")) {
	    var userData = getFromCookie('userData');
	    userData.mocambolaUrl = '#' + config.MYREPOSITORY + '/' + config.MYMUCUA + '/mocambola/' + userData.username
	    userData.avatar = getAvatar();
	    if ($('#link-login')) {
		$('#link-login').remove();
	    }
	    $('#user-profile').html(_.template(UserProfileTpl, userData));
	}

	// busca dados básicos da mucua
	// carrega quando:
	// - nao tem nada
	// - mucua

	if (typeof BBX.mucua === 'undefined' || _.isEmpty(BBX.mucua)) {
	    loadMucua = true;
	} else if (_.isObject(BBX.mucua)) {
	    if (typeof BBX.mucua.uuid === 'undefined') {		    
		loadMucua = true;
	    } else {
		loadMucua = false;
	    }
	}
	
	// caso 1: nada carregado
	if (loadMucua) {	    
	    var mucua = new MucuaModel([], {url: config.apiUrl + '/mucua/by_name/' + config.MYMUCUA});
	    mucua.fetch({
		success: function() {
		    BBX.mucua = mucua.attributes;
		    
		    var mucuaLoad = setInterval(function() {
			if (typeof BBX.mucua !== 'undefined') {
			    if (typeof BBX.network === 'undefined') {
				__getMucuaResources(BBX.mucua.uuid);
			    }		    
			    clearInterval(mucuaLoad)
			}
		    }, 100);		
		}
	    });
	}

	// REDE
	if (config.mucua === 'rede' || config.mucua === '') {
	    console.log('rede');
	    var networkResourcesLoad = setInterval(function() {
		if (typeof BBX.network !== 'undefined') {
		    if (typeof BBX.network.info !== 'undefined') {
			if (typeof BBX.network.info.network_size !== 'undefined') {
			    var networkData = BBX.network;
			    networkData.mucua.storageSize = BBX.network.info.network_size;
			    networkData.usedByAnnexUnit = BBX.network.info.usedByAnnexUnit;
			    networkData.config = config;
			    
			    $('#place-profile').html(_.template(MucuaProfileTpl, networkData));
			    console.log(networkData.mucua.image);
			    $('#place-profile #mucua_image').prop('src', networkData.mucua.image);
			    
			    clearInterval(networkResourcesLoad);
			}
		    }
		}
	    }, 1000);
	} else {
	    // MUCUA
	    var mucuaResourcesLoad = setInterval(function() {
		if (typeof BBX.mucua !== 'undefined') {
		    if (typeof BBX.mucua.info !== 'undefined') {
			console.log(BBX.mucua.info.usedByAnnexUnit);
			if (config.mucua === config.MYMUCUA) {
			    // mucua local
			    mucuaData = {
				mucua: BBX.mucua,
				usedByAnnexUnit: BBX.mucua.info.usedByAnnexUnit,
				config: config
			    };	    
			    
			    mucuaData.mucua.storageSize = BBX.mucua.info.usedByAnnex;
			    $('#place-profile').html(_.template(MucuaProfileTpl, mucuaData));
			    
			    // verifica se a mucua tem uma imagem / media com nome do seu uuid
			    var urlMucuaImage = config.apiUrl + '/' + config.MYREPOSITORY + '/' + mucuaData.mucua.description + '/bbx/search/' + mucuaData.mucua.uuid,
				mucuaImageSrc = '';
			    
			    if (typeof mucua === 'undefined') {
				var mucua = new MucuaModel([]);
			    }
			    // carrega imagem
			    mucuaImageSrc = mucua.getImage(urlMucuaImage, function(imageSrc){
				$('#mucua_image').prop('src', imageSrc);
			    });
			    
			} else {
			    
			    // mucua de fora			    
			    var mucua = new MucuaModel([], {url: config.apiUrl + '/mucua/by_name/' + config.mucua});
			    mucua.fetch({
				success: function() {
				    mucuaData = {
					mucua: mucua.attributes,
					usedByAnnexUnit: BBX.mucua.info.usedByAnnexUnit,					
					config: config					
				    };
				    
				    // FAKE DATA
				    mucuaData.mucua.url = ''; // TODO: get from API
				    $('#place-profile').html(_.template(MucuaProfileTpl, mucuaData));
				    
				    // carrega imagem
				    // verifica se a mucua tem uma imagem / media com nome do seu uuid
				    var urlMucuaImage = config.apiUrl + '/' + config.MYREPOSITORY + '/' + mucuaData.mucua.description + '/bbx/search/' + mucuaData.mucua.uuid,
					mucuaImageSrc = '';
				    
				    mucuaImageSrc = mucua.getImage(urlMucuaImage, function(imageSrc){
					$('#mucua_image').prop('src', imageSrc);
				    });
				}
			    });  
			}
			clearInterval(mucuaResourcesLoad);
		    }
		}
	    }, 100);		
	}	
    }
    
    /**
     * get last visited Mucua
     *
     * @return {Object} with list of last visited mucuas
     */
    var __getLastVisitedMucuas = function() {
	// get last visited mucuas
	var config = __getConfig(),
	visitedMucuas = {'name': 'visitedMucuas', 
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
		
		// adicinoa ao comeco (mas nao exibe no template)
		visitedMucuas.values.unshift(config.mucua);
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
	var config = BBX.config;
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
	var config = BBX.config;
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
	var config = BBX.config;
	
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
	// configuracoes padrao: config.js
	var jsConfig = jsConfig || '',
	    config = jsConfig;
	
	__getMyMucua();
	__getDefaultRepository();
	__getRepositories();	
	
	// so preenche quando todos tiverem carregado
	var loadData = setInterval(function() {
	    if (typeof config.MYMUCUA !== 'undefined' &&
		typeof config.MYREPOSITORY !== 'undefined' &&
		typeof config.repositoriesList !== 'undefined') {	
		BBX.config = config;
		clearInterval(loadData);
	    }
	}, 50);	    
    }

    
    /**
     * Get config data
     *
     * @return {Object} input object with config data
     */
    var __getConfig = function() {
	return BBX.config;
    }
    
    
    /**
     * Set navigation variables
     *
     * @repository {String} Repository name
     * @mucua {String} Mucua name
     * @subroute {String} Internal url subroute 
     * @return {Object} input object with config data
     */
    var setNavigationVars = function(repository, mucua, subroute) {
	var subroute = subroute || '',
	    reMedia = /^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}/,  // padrao de uuid
	    reMocambola = /^[0-9a-zA-Z-_]*@[0-9a-zA-Z-_\.]*\.[a-zA-Z]{2,4}/,
	    reSearch = /search/,
	    matchMedia = '',
	    matchSearch = '',
	    matchMocambola = '',
	    config = __getConfig(),
	    currentPage = Backbone.history.location.href;
	
	config.repository = repository;
	config.mucua = mucua;
	config.subroute = subroute;
	
	// adds current url to redirect
	if (!currentPage.match('login')) {
	    if(isCookiesEnabled()) {
		addToCookie({
		    'name': 'redirect_url',
		    'values': {
			0: Backbone.history.location.href
		    }
		});
	    }
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
	
	if (config.subroute == '') {
	    config.subroute = 'bbx/search';
	}
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

    /**
     * verifica se há tags funcionais
     *
     * return {None} [conteúdo definido pelo jQuery]
     */
    var checkFunctionalTag = function() {
	console.log('checkFunctionalTag');
	var config = __getConfig(),	
	    tags = MediaFunctions.__getTagsFromUrl().join('/'),
	    urlApi = config.apiUrl + '/tags/functional_tag/' + tags,
	    tag = new TagModel([], {url: urlApi});

	// cria objeto na variavel global do BBX
	BBX.codeObj = {};
	
	tag.fetch({
	    success: function() {
		var code = tag.attributes;
		// copia código para obj global
		BBX.codeObj = _.extend(BBX.codeObj, code);
	    }
	});
	
	var functionalTagLoad = setInterval(function() {
	    // se tiver tags funcionais
	    if (typeof BBX.codeObj !== 'undefined') {
		// inspeciona chaves / tags funcionais
		for (var tagName in BBX.codeObj) {
		    if (BBX.codeObj.hasOwnProperty(tagName)) {
			// inspeciona cada arquivo da funcao
			for (var file in BBX.codeObj[tagName].code) {
			    if (BBX.codeObj[tagName].code.hasOwnProperty(file)) {
				// cria objeto script
				var nscr = document.createElement('script');
				nscr.type = 'text/javascript';
				nscr.textContent = BBX.codeObj[tagName].code[file];
				nscr.setAttribute('name', 'dynamically inserted: ');
				$('head').append(nscr);
			    }
			}
		    }
		}
		clearInterval(functionalTagLoad);		   
	    }
	}, 100);	
    }

    /**
     * trunca texto e adiciona limitador
     *
     * @param {String} text Texto a ser truncado
     * @param {Integer} size Tamanho do texto
     * @param {String} delimiter String delimitadora
     * @returns {String} texto truncado
     */
    var truncate = function(text, size, delimiter) {
	var size = size || 35,
	    delimiter = delimiter || '...';
	text = text.substring(0, size) + (
	    (text.length > size) ? delimiter : ''
	);
	
	return text;
    }


    
    // public functions are defined above
    return {
	init: init,
	isLogged: isLogged,
	isCookiesEnabled: isCookiesEnabled,
	getFromCookie: getFromCookie,
	addToCookie: addToCookie,
	getDefaultHome: getDefaultHome,
	getAvatar: getAvatar,
	renderCommon: renderCommon,
	renderUsage: renderUsage,
	renderSidebar: renderSidebar,
	setNavigationVars: setNavigationVars,
	formatDate: formatDate,
	checkFunctionalTag: checkFunctionalTag,
	truncate: truncate
    }
});
    
