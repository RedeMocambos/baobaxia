define([
    'jquery', 
    'underscore',
    'backbone',
    'json!config.json',
    'modules/repository/model', 
    'modules/mucua/model',
    'text!templates/common/menu.html',
    'text!templates/common/busca.html',
    'modules/common/HeaderView',
    'modules/common/FooterView',
], function($, _, Backbone, DefaultConfig, RepositoryModel, MucuaModel, Menu, Busca, HeaderView, FooterView){
    return {
	initialize: function() {
	    console.log('inicializa functions bbx');
	    this.setConfig();
	},
	
	setConfig: function(config) {
	    // configuracoes padrao: config.json
	    config = config | '';
	    
	    if (typeof this.config === 'undefined') {
		this.config = (config != '') ? config : DefaultConfig;
		$("body").data("data").config = this.config;
		
		// busca informacoes da mucua default na api
		var defaultMucua = new MucuaModel([], {url: this.config.apiUrl + '/mucua/'});
		defaultMucua.fetch({
		    success: function() {		    
			$("body").data("data").config.defaultMucua = defaultMucua.attributes[0].description;
			$("body").data("data").trigger("updatedConfig");
		    }
		});
	    }
	    $("body").data("data").on("updatedConfig", function() {
		this.config = $("body").data("data").config;
	    });
	},
	
	getConfig: function() {
	    if (typeof this.config === 'undefined') 
		this.setConfig();

	    return this.config;
	},
	
	// get repository / mucua
	setBaseData: function(repository, mucua) {
	    repository = repository || '';
	    mucua = mucua || '';
	    
	    this.setConfig();
	    
	    if (repository != '' && mucua != '') {
		// get both by url
		$("body").data("data").repository = repository;
		$("body").data("data").mucua = mucua;
		$("body").data("data").trigger("changedData");
	    } else {
		if (repository != '' & mucua == '') {
		    // repository by url, mucua by API
		    $("body").data("data").repository = repository;
		    var defaultMucua = new MucuaModel([], {url: this.config.apiUrl + '/mucua/'});
		    defaultMucua.fetch({
			success: function() {
			    $("body").data("data").mucua = defaultMucua.attributes[0].description;
			    $("body").data("data").trigger("changedData");
			}
		    }); 
		} else if (repository == '' & mucua != '') {
		    // repository by API, mucua by url
		    $("body").data("data").mucua = mucua;
		    var defaultRepository = new RepositoryModel([], {url: this.config.apiUrl + '/repository/'});
		    defaultRepository.fetch({
			success: function() {
			    $("body").data("data").repository = defaultRepository.attributes[0].name;
			    $("body").data("data").trigger("changedData");
			}
		    });
		} else {
		    // get both from API
		    var defaultRepository = new RepositoryModel([], {url: this.config.apiUrl + '/repository/'});
		    defaultRepository.fetch({
			success: function() {
			    $("body").data("data").repository = defaultRepository.attributes[0].name;
			    this.config = $("body").data("data").config;
			    var defaultMucua = new MucuaModel([], {url: this.config.apiUrl + '/mucua/'});
			    defaultMucua.fetch({
				success: function() {
				    $("body").data("data").mucua = defaultMucua.attributes[0].description;
				    $("body").data("data").trigger("changedData");
				}
			    });
			}
		    });
		}
	    }
	},
	
	renderCommon: function(repository, mucua) {
	    repository = repository || '';
	    mucua = mucua || '';
	    
	    // carrega partes comuns; carrega dados basicos para todos
	    this.setBaseData(repository, mucua);
	    // debug
	    // $("body").data("data").on("all", function(event) {console.log(event)});

	    //// event catchers para os carregamentos de dados
	    // atualizacao de repositorio e mucua
	    $("body").data("data").on("changedData", function() {
		$("body").data("data").changedData = true;
		if ($("body").data("data").updatedConfig == true) {
		    $("body").data("data").trigger("renderFinish");
		    $("body").data("data").changedData = false;
		    $("body").data("data").updatedConfig = false;
		}
	    });
	    // atualizacao das configuracoes
	    $("body").data("data").on("updatedConfig", function() {
		$("body").data("data").updatedConfig = true;
		if ($("body").data("data").changedData == true) {
		    $("body").data("data").trigger("renderFinish");
		    $("body").data("data").changedData = false;
		    $("body").data("data").updatedConfig = false;
		}
	    });

	    // renderiza quando todos os dados forem carregados
	    $("body").data("data").on("renderFinish", function() {
		if ($("body").data("data").repository != '' && $("body").data("data").mucua != '') {
		    repository = (repository != '') ? repository : $("body").data("data").repository;
		    mucua = (mucua != '') ? mucua : $("body").data("data").mucua;
		    data = {'repository': repository, 'mucua': mucua, 'config': $("body").data("data").config};
		    
		    if ($('#header').html() == '') {			
			var headerView = new HeaderView();
			headerView.render(data);
		    }
		    if ($('#footer').html() == '') {
			var footerView = new FooterView();
			footerView.render(data);
		    }		
		    if (typeof $('#busca-menu').html() === 'undefined') {
			$('#content-full').prepend(_.template(Menu, data));
			$('#busca-menu').append(_.template(Busca, data));
		    }
		}
	    });

	    $("body").data("data").renderCommon = true;
	}	
    }
});