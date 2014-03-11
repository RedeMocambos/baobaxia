define([
    'jquery', 
    'underscore',
    'jquery_cookie',
    'jquery_form',
    'backbone', 
    'modules/bbx/base-functions',
    'modules/media/model',
    'text!templates/common/menu.html',
    'text!templates/common/busca.html',
    'text!templates/media/MediaPublish.html'
], function($, _, jQueryCookie, jQueryForm, Backbone, BBXBaseFunctions, MediaModel, Menu, Busca, MediaPublishTpl){
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
	    
	    getMediaBaseData = function() {
		repository = $('body').data('data').repository;
		mucua = $('body').data('data').mucua;
		author = $('body').data('data').author;
		//console.log($('body').data('data'));
		media = {
		    repository: repository,
		    mucua: mucua,
		    author: author
		}
		return media;
	    }
	    
	    
	    uploadFile = function() {
		console.log('upload');

		url = $('body').data('data').config.apiUrl + "/" + mediaBase.repository + "/" + mediaBase.mucua + "/media/";
		var media = new MediaModel([], {url: url});
		
		media.fetch({
		    success: function() {
			var csrftoken = $.cookie('csrftoken');
			$('#csrfmiddlewaretoken').attr('value', csrftoken);
		    }
		});
		
		// # $ curl -F "name=teste123" -F "tags=entrevista" -F "note=" -F "license=" -F "date=2013/06/07" -F "type=imagem" -F "mediafile=@img_0001.jpg" -X POST http://localhost:8000/redemocambos/dandara/media/ > /tmp/x.html          
		fields = {};
		$('#form_media_publish :input').each(function() {
		    fields[this.name] = this.value;
//		    console.log(this);
		});
		
		//console.log(fields);
		// TODO: adicionar tags separadas (patrimonio, publico) a tags
		data = {
		    name: fields['name'].value,
		    origin: fields['origin'].value,
		    author: fields['author'].value,
		    repository: fields['repository'].value,
		    tags: fields['tags'].value,
		    license: fields['license'].value,
		    date: fields['date'].value,
		    type: fields['type'].value,
		    note: fields['note'].value,
		    mediafile: fields['mediafile'].value
		}
		//console.log('data');
		//		console.log(data);
		url = $('body').data('data').config.apiUrl + "/" + mediaBase.repository + "/" + mediaBase.mucua + "/media/";
		$('#form_media_publish').attr('action', url);
		
		var media = new MediaModel([], {url: url});
	    }
	    
	    data = {
		media: getMediaBaseData()
	    };
	    
	    var compiledTpl = _.template(MediaPublishTpl, data);
	    $('#content').html(compiledTpl);
	    $("body").data("data").on("all", function(event) {console.log(event)});
	    $('#mediafile').change(function() {uploadFile()});
	    
	    // form upload progress meter
	    var bar = $('.bar');
	    var percent = $('.percent');
	    var status = $('#status');
	    
	    $('#form_media_publish').ajaxForm({
		beforeSend: function() {
		    status.empty();
		    var percentVal = '0%';
		    bar.width(percentVal)
		    percent.html(percentVal);
		    },
		uploadProgress: function(event, position, total, percentComplete) {
		    var percentVal = percentComplete + '%';
		    bar.width(percentVal)
		    percent.html(percentVal);
		},
		success: function() {
		    var percentVal = '100%';
		    bar.width(percentVal)
		    percent.html(percentVal);
		},
		complete: function(xhr) {
		    status.html(xhr.responseText);
		    serializedData = xhr.responseText;
		    console.log(serializedData);
		    console.log('// abre tela de update (completa)');
		}
	    });

	    mediaBase = getMediaBaseData();
	    $('#repository').attr('value', mediaBase.repository);
	    $('#origin').attr('value', mediaBase.mucua);
	    $('#author').attr('value', mediaBase.author);
	    
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