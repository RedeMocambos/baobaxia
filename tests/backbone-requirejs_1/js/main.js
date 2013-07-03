// funcao main, usa require
// mapeia libs usadas, a serem chamadas pelo require

requirejs.config({
/*    enforceDefine: true,*/
    paths: {
	jquery: 'lib/jquery-min',
	underscore: 'lib/underscore-amd',
	backbone: 'lib/backbone-amd',
	templates: '../templates',
    },
    shin: {
	underscore: { 
	    deps: [],
	    exports: '_'
	},
	backbone: {
	    deps: ['jquery', 'underscore'],
	    exports: 'Backbone'
	},
    }
});

define([
    'jquery', 'underscore', 'backbone', 'app'
], function($, _, Backbone, App){
    App.initialize();
});