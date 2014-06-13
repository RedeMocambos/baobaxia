define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/mucua/model',
    'json!config.json',
], function($, _, Backbone, MucuaModel, DefaultConfig){
    
    // functions
    var initialize = function() {
	console.log('inicializa functions bbx');
	__setConfig(DefaultConfig);
    }
    
    var __setConfig = function(config) {
	// configuracoes padrao: config.json
	var config = config || '',	
	bbxData = $("body").data("bbx") || {};
	
	if (typeof bbxData == 'undefined' || _.isEmpty(bbxData)) {
	    
	    var defaultMucua = new MucuaModel([], {url: config.apiUrl + '/mucua/'});
	    defaultMucua.fetch({
		success: function() {		    
		    bbxData.defaultMucua= defaultMucua.attributes[0].description;
		}
	    });
	    console.log(bbxData);
	    var loadData = setInterval(function() {
		if (!typeof bbxData.defaultMucua === 'undefined' || _.isEmpty(bbxData)) {		 
		    $("body").data("bbx").defaultMucua = bbxData.defaultMucua;
		    clearInterval(loadData);
		}
	    }, 50);	    
	}
    }    
    
    return {
	initialize: initialize,
    }
});

    