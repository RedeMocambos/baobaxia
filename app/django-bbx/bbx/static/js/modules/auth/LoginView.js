define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/repository/model',
    'modules/mucua/model',
    'modules/mucua/collection',
    'json!config.json',
    'text!templates/auth/LoginTemplate.html'
], function($, _, Backbone, RepositoryModel, MucuaModel, MucuaCollection, Config, LoginTemplate){
    var LoginView = Backbone.View.extend({
	
	render: function(){
	    var __parseTemplate = function(data) {
		// parse header
		$('body').removeClass("").addClass("login");
		
		// parse content
		var compiledContent = _.template(LoginTemplate, data);
		$('#content').html(compiledContent);
	    }
	    
	    var loadedData = setInterval(function() {
		var configLoaded = $("body").data("bbx").configLoaded;
		
		// when all configs are loaded, load mucuas
		if (configLoaded) {
		    repository = $("body").data("bbx").defaultRepository;
		    myMucua = $("body").data("bbx").myMucua;
		    repositoriesList = $("body").data("bbx").repositoriesList;
		    
		    // get mucuas 
		    var mucuas = new MucuaCollection([], {url: Config.apiUrl + '/' + repository.name + '/mucuas'});
		    mucuas.fetch({
			success: function() {
			    var mucuasLength = mucuas.models.length,
			    mucuaList = [];
			    $("body").data("bbx").mucuaList = [];
			    
			    for (var m = 0; m < mucuasLength; m++) {
				mucuaName = mucuas.models[m].attributes;
				mucuaList.push(mucuaName);
			    }
			    $("body").data("bbx").mucuaList = mucuaList;
			    
			    data = {
				defaultRepository: repository,
				mucuaList: mucuaList,
				myMucua: myMucua,
				repositoryList: repositoriesList
			    }
			    console.log(data);
			    __parseTemplate(data);			    
			}
		    });
		    
		    clearInterval(loadedData);
		}
	    }, 50);
	}
    })
    return LoginView;
});