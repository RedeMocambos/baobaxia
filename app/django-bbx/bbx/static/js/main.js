// funcao main, usa require
// mapeia libs usadas, a serem chamadas pelo require

require.config({
    shin: {
	lodash: { 
	    exports: '_'
	},
	backbone: {
	    deps: ['lodash', 'jquery'],
	    exports: 'Backbone'
	},
	jquery: {
	    exports: '$'
	},
	'textext': {
	    deps: ['jquery'],
	    exports: ['$.fn.textext']
	},
	'textext_tags': {
	    deps: ['textext'],
	    exports: ['$.fn.textext.tags']
	},
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
	textext: 'lib/textext/textext.core',
	textext_tags: 'lib/textext/textext.plugin.tags',
        json: 'lib/require/json',
        text: 'lib/require/text',
	jquery_ui: 'lib/jquery.ui.widget',
	fileupload_iframe_transport: 'lib/jquery.iframe-transport',
	fileupload: 'lib/jquery.fileupload',
    },
    waitSeconds: 200
});

require([
    'jquery', 'lodash', 'backbone', 'app', 'backbone_subroute'], function($, _, Backbone, App){
	// add csrftoken support to backbone posts
	// thx to https://gist.github.com/gcollazo/1240683 :D
	var oldSync = Backbone.sync;
	Backbone.sync = function(method, model, options) {
	    options.beforeSend = function(xhr) {
		xhr.setRequestHeader('X-CSRFToken', $.cookie('csrftoken'));
	    }
	    return oldSync(method, model, options);
	}
	App.initialize();
});
