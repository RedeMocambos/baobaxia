define([
    'jquery', 
    'underscore',
    'backbone', 
    'modules/media/model',
    'text!templates/common/header.html',
    'text!templates/common/menu.html',
    'text!templates/common/busca.html',
    'text!templates/common/footer.html',
    'text!templates/media/MediaVisualizacao.html'
], function($, _, Backbone, MediaModel, Header, Menu, Busca, Footer, MediaVisualizacao){
    
    var MediaView = Backbone.View.extend({
	
	render: function(uuid){
	    console.log("busca media " + uuid);
	    console.log("/" + repository + "/" + mucua + "/medias/" + uuid);
	    
	    // TODO: colocar todo esse bloco (até o TODO FIM) numa funcao generica externa
	    // compila cabecalho
	    if ($('#header').html() == '') {
		$('#header').append(_.template(Header, {'name': mucua}));
	    }
	    
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
	    
	    url = '/api/' + repository + '/' +  mucua + '/media/' + uuid;
	    var media = new MediaModel([], {url: url});
	    media.fetch({
		success: function() {
		    var data = {	
			media: media,
		    }
		    
		    var compiledTemplate = _.template(MediaVisualizacao, data);
		    if (typeof $('#media-view').html() === 'undefined') {
			$('#content').html(compiledTemplate);
		    }
		}
	    });
	    
	    // compila footer
	    if ($('#footer').html() == '') {
		$('#footer').append(Footer);
	    }
	}
    });
    return MediaView;
});