// funcao main, usa require
// mapeia libs usadas, a serem chamadas pelo require

require.config({
    shim: {
	lodash: { 
	    exports: '_'
	},
	backbone: {
	    deps: ['jquery', 'lodash'],
	    exports: 'Backbone'
	},
	jquery: {
	    exports: '$'
	},
	textext: {
	    deps: ['jquery'],
	    exports: '$.fn.textext'
	},
	textext_ajax: {
	    deps: ['jquery', 'textext']
	},
	textext_filter: {
	    deps: ['jquery', 'textext']
	},
	textext_tags: {
	    deps: ['jquery', 'textext']
	},
	textext_autocomplete: {
	    deps: ['jquery', 'textext']
	},
	fancybox: {
	    deps: ['jquery', 'jquery_mousewheel']
	},
	fancybox_buttons: {
	    deps: ['fancybox']
	},
	fancybox_media: {
	    deps: ['fancybox']
	}
   },
    paths: {
	jquery: 'lib/jquery-min',
	jquery_cookie: 'lib/jquery.cookie',
	jquery_json: 'lib/jquery.json.min',
	jquery_form: 'lib/jquery.form.min',
	underscore: 'lib/underscore-amd',
	lodash: 'lib/lodash-min',
	backbone: 'lib/backbone-amd',
 	backbone_form: 'lib/backbone-forms.min',
	templates: '../templates',
	backbone_subroute: 'lib/backbone.subroute.min',
	tagcloud: 'lib/jquery.tagcloud',
	fancybox: 'lib/jquery.fancybox.pack',
	fancybox_media: 'lib/jquery.fancybox-media',
	fancybox_buttons: 'lib/jquery.fancybox-buttons',
	jquery_mousewheel: 'lib/jquery.mousewheel.pack',
	textext: 'lib/textext/textext.core',
	textext_tags: 'lib/textext/textext.plugin.tags',
	textext_ajax: 'lib/textext/textext.plugin.ajax',
	textext_filter: 'lib/textext/textext.plugin.filter',
	textext_autocomplete: 'lib/textext/textext.plugin.autocomplete',
        json: 'lib/require/json',
        text: 'lib/require/text',
	fileupload_iframe_transport: 'lib/jquery.iframe-transport',
	fileupload: 'lib/jquery.fileupload',
    },
    waitSeconds: 200
});

require([
    'jquery', 'lodash', 'backbone', 'app', 'backbone_subroute'], function($, _, Backbone, App){
	// add header token if present
	var oldSync = Backbone.sync;
	Backbone.sync = function(method, model, options) {
	    options.beforeSend = function(xhr) {
		if (typeof sessionStorage.token !== 'undefined') {
		    xhr.setRequestHeader('Authorization', 'Bearer ' +  sessionStorage.token);
		}
	    }
	    return oldSync(method, model, options);
	}
	App.initialize();
});
