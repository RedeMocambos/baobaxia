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
	'crypto': {
	    exports: ['CryptoJS']
	},
        'crypto.SHA2': {
	    deps: ['crypto'],
	    exports: ['CryptoJS.SHA2']
	},
    },
    paths: {
	jquery: 'lib/jquery-min',
	jquery_cookie: 'lib/jquery.cookie',
	jquery_form: 'lib/jquery.form.min',
	underscore: 'lib/underscore-amd',
	backbone: 'lib/backbone-amd',
 	backbone_form: 'lib/backbone-forms.min',
	templates: '../templates',
	backbone_subroute: 'lib/backbone.subroute.min',
        json: 'lib/require/json',
        text: 'lib/require/text',
        'crypto': 'lib/cryptojs/crypto',
        'crypto.SHA2': 'lib/cryptojs/sha256',
    },
    waitSeconds: 200
});

require([
    'jquery', 'underscore', 'backbone', 'app', 'backbone_subroute', 'crypto', 'crypto.SHA2'], function($, _, Backbone, App){
    App.initialize();
});