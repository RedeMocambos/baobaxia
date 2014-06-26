// funcao main, usa require
// mapeia libs usadas, a serem chamadas pelo require

require.config({
    shin: {
	underscore: { 
	    exports: '_'
	},
	backbone: {
	    deps: ['underscore', 'jquery'],
	    exports: 'Backbone'
	},
    },
    paths: {
	jquery: 'lib/jquery-min',
	jquery_cookie: 'lib/jquery.cookie',
	jquery_json: 'lib/jquery.json.min',
	underscore: 'lib/underscore-amd',
	backbone: 'lib/backbone-amd',
 	backbone_form: 'lib/backbone-forms.min',
	templates: '../templates',
	backbone_subroute: 'lib/backbone.subroute.min',
	tagcloud: 'lib/jquery.tagcloud',
        json: 'lib/require/json',
        text: 'lib/require/text',	
    },
    waitSeconds: 200
});

require([
    'jquery', 'underscore', 'backbone', 'app', 'backbone_subroute'], function($, _, Backbone, App){

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