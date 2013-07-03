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
	}
    },
    paths: {
	jquery: 'lib/jquery-min',
	underscore: 'lib/underscore-amd',
	backbone: 'lib/backbone-amd',
	templates: '../templates',
    },
    waitSeconds: 200
});

require([
    'jquery', 'underscore', 'backbone', 'app'
], function($, _, Backbone, App){
    App.initialize();
});