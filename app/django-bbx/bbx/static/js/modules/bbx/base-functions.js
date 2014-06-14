define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/mucua/model',
    'modules/repository/model',
    'json!config.json',
], function($, _, Backbone, MucuaModel, RepositoryModel, DefaultConfig){
    
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
    
    
    //// getMyMucua
    // - get actual mucua
    var __getMyMucua = function(config) {
	var myMucua = new MucuaModel([], {url: config.apiUrl + '/mucua/'});
	myMucua.fetch({
	    success: function() {		    
		$("body").data("bbx").myMucua = myMucua.attributes[0].description;
	    }
	});
    }
    
    //// getDefaultRepository
    // - get actual repository
    var __getDefaultRepository = function(config) {
	// get defaultRepository()
	var defaultRepository = new RepositoryModel([], {url: config.apiUrl + '/repository/'});
	defaultRepository.fetch({
	    success: function() {
		$("body").data("bbx").defaultRepository = defaultRepository.attributes[0]; 
	    }
	});
    }    

    var __getRepositories = function() {
	// TODO: puxar lista real de repositorios
	//var listRepositories = new RepositoryModel([], {url: Config.apiUrl + '/repository/list'});
	$("body").data("bbx").repositoriesList = [{name: 'mocambos'}];  // hardcoded enquanto nao esta funcional
    }
    
    //// set configuration
    // - get configurations from config.json and from API
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
		
		$("body").data("bbx").configLoaded = true;
		clearInterval(loadData);
	    }
	}, 50);	    
    } 
    
    return {
	init: init,
    }
});

    