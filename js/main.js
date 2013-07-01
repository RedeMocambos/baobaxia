// funcao main, usa require
// mapeia libs usadas, a serem chamadas pelo require

require.config({
    paths: {
	jquery: 'lib/jquery-min',
	underscore: 'lib/underscore-min',
	backbone: 'lib/backbone-min',
	templates: '../templates',
    }
});

require([
    'app',    
], function(App){
    App.initialize();
});