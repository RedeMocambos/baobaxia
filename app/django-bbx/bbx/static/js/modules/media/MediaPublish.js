define([
    'jquery', 
    'underscore',
    'jquery_cookie',
    'jquery_form',
    'backbone', 
    'modules/bbx/base-functions',
    'modules/media/model',
    'text!templates/media/MediaEditForm.html'
], function($, _, jQueryCookie, jQueryForm, Backbone, BBXBaseFunctions, MediaModel, MediaEditFormTpl){
    var MediaPublish = Backbone.View.extend({
	
	render: function(uuid){
	    /***
	     * Funções internas
	     */
	    getMediaBaseData = function() {
		repository = $('body').data('data').repository;
		mucua = $('body').data('data').mucua;
		origin = mucua;
		author = $('body').data('data').author;
		baseurl = '#' + repository + '/' + mucua;
		types = {
		    '': '',
		    'audio': 'audio',
		    'imagem': 'imagem',
		    'video': 'video',
		    'arquivo': 'arquivo'
		};

		//var media = { 		    get: function(attr) {return this.attr}, 		}
		var media = new MediaModel([]);
		media.repository = repository;
		media.origin = origin;
		media.author = author;
		media.date = '';
		media.uuid = '';
		media.name = '';
		media.format = '';
		media.license = '';
		media.mediafile = '';
		media.note = '';
		media.tags = [];
		media.type = '';
		
		return media;
	    }    
	    
	    uploadFile = function() {
		console.log('upload');

		url = $('body').data('data').config.apiUrl + "/" + mediaBase.repository + "/" + mediaBase.origin + "/media/";
		console.log(url);
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
		});
		
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
		url = $('body').data('data').config.apiUrl + "/" + mediaBase.repository + "/" + mediaBase.origin + "/media/";
		$('#form_media_publish').attr('action', url);
		
		var media = new MediaModel([], {url: url});
	    }
	    
	    updateMedia = function(media) {
		url = $('body').data('data').config.interfaceUrl + mediaBase.repository + "/" + mediaBase.origin + "/media/" + media.uuid + '/edit';
		document.location.href = url;
	    }

	    /***
	     * Tarefas
	     */
	    this.config = BBXBaseFunctions.getConfig();
	    
	    data = {
		media: getMediaBaseData(),
		licenses: {'': ''},
		page: 'MediaPublish',
	    };
	    var compiledTpl = _.template(MediaEditFormTpl, data);
	    $('#content').html(compiledTpl);
	    
	    $('#media-update .bloco-2').hide();
	    $('#media-update .bloco-1 .tags').hide();
	    
	    $('body').data('data').on('all', function(event) {});
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
		    mediaSerialized = eval('('+ xhr.responseText +')');
		    updateMedia(mediaSerialized);
		}
	    });
	    
	    $('#submit').on('click', function() {
		$('#form_media_publish').submit()
	    });
	    
	    mediaBase = getMediaBaseData();
	    $('#repository').attr('value', mediaBase.repository);
	    $('#origin').attr('value', mediaBase.origin);
	    $('#author').attr('value', mediaBase.author);
	    
	    // passo 1:
	    // - sobe titulo e arquivo (upload) - ok
	    // - instancia e retorna com uuid etc - ok
	    // - ativa preenchimento do resto, de acordo com o arquivo - ok
	    //   - pega tipo de arquivo e formato
	    //   - futuramente: diferenciar preenchimento por tipo de arquivo
	    //   - preencher resto das informacoes
	},
    });
    
    return MediaPublish;    
});