define([
    'jquery', 
    'underscore',
    'backbone', 
    'modules/bbx/base-functions',
    'modules/media/model',
    'text!templates/common/menu.html',
    'text!templates/common/busca.html',
    'text!templates/media/MediaVisualizacao.html'
], function($, _, Backbone, BBXBaseFunctions, MediaModel, Menu, Busca, MediaVisualizacao){
    
    var MediaView = Backbone.View.extend({
	
	render: function(uuid){
	    console.log("busca media " + uuid);
	    console.log("/" + repository + "/" + mucua + "/medias/" + uuid);
	    
	    // compila menu e busca
	    if (typeof $('#busca-menu').html() === 'undefined') {
		$('#content-full').prepend(_.template(Menu, repository, mucua));
		
		// TODO: busca está junto com menu nessa versao, talvez separar futuramente como um módulo configurável
		$('#busca-menu').append(_.template(Busca, {'repository': repository}, {'name': mucua}));
		
		//TODO: talvez seja legal buscar uma forma backbone de implementar os eventos
		do_search = function() {
		    url = $('#form_busca').attr('action') + $('#expressao_busca').val();;
		    document.location.href = url;
		}
		
		$('#busca .button').click(function() { do_search() });
		$('#expressao_busca').keyup(function(e) { if (e.keyCode == 13) do_search(); });   // enter
	    }
	    // TODO FIM
	    this.config = BBXBaseFunctions.getConfig();
	    url = this.config.apiUrl + '/' + repository + '/' +  mucua + '/media/' + uuid;
	    baseurl = '#' + repository + '/' + mucua;
	    var media = new MediaModel([], {url: url});
	    media.fetch({
		success: function() {
		    var data = {	
			media: media,
			baseurl: baseurl,
		    }
		    
		    var compiledTemplate = _.template(MediaVisualizacao, data);
		    $('#content').html(compiledTemplate);
		}
	    });
	}
    });
    return MediaView;
});