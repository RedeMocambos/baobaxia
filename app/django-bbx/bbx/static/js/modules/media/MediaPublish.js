define([
    'jquery', 
    'underscore',
    'backbone', 
    'modules/bbx/base-functions',
    'modules/media/model',
    'text!templates/common/menu.html',
    'text!templates/common/busca.html',
    'text!templates/media/MediaPublish.html'
], function($, _, Backbone, BBXBaseFunctions, MediaModel, Menu, Busca, MediaPublishTpl){
    var MediaPublish = Backbone.View.extend({
	
	render: function(uuid){
	    
	    this.config = BBXBaseFunctions.getConfig();
	    
	    /*
	    url = this.config.apiUrl + '/media/get_uuid';
	    
	    // get uuid
	    var mediaUuid = new MediaModel([], {url: url});
	    mediaUuid.fetch({
		success: function() {
		    uuid = mediaUuid.attributes.uuid;
		    $('#uuid').html(uuid);
		}
	    });
	    */
	    
	    uploadFile = function() {
		data = {};
		console.log('upload');
	    }
	    
	    data = {
		media: {}
	    };
	    
	    var compiledTpl = _.template(MediaPublishTpl, data);
	    $('#content').html(compiledTpl);
	    $("body").data("data").on("all", function(event) {console.log(event)});
	    $('#mediafile').change(function() {uploadFile()});
	    
	    // passo 1:
	    // - sobe titulo e arquivo (upload)
	    // - instancia e retorna com uuid etc
	    // - ativa preenchimento do resto, de acordo com o arquivo
	    //   - pega tipo de arquivo e formato
	    //   - futuramente: diferenciar preenchimento por tipo de arquivo
	    //   - preencher resto das informacoes
	},
    });
    
    return MediaPublish;    
});