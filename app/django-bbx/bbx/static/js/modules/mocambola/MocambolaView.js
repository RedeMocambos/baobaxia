define([
    'jquery', 
    'underscore',
    'backbone', 
    'modules/bbx/base-functions',
    'modules/mocambola/model',
    'text!templates/mocambola/MocambolaVisualizacao.html'
], function($, _, Backbone, BBXBaseFunctions, MocambolaModel, MocambolaVisualizacao){
    var MocambolaView = Backbone.View.extend({
	
	render: function(username){
	    this.config = BBXBaseFunctions.getConfig();
	    urlMocambola = this.config.apiUrl + repository + '/' + mucua + '/mocambola/' + username;
	    var mocambola = new MocambolaModel([], {url: urlMocambola});
	    mocambola.fetch({
		success: function() {
		    var data = {
			mocambola: mocambola,
			repository: repository,
			mucua: mucua
		    }
		    
		    var compiledTemplate = _.template(MocambolaVisualizacao, data);
		    $('#content').html(compiledTemplate);
		}
	    });
	}
    });
    
    return MocambolaView;
});