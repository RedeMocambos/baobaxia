define([
    'jquery', 
    'underscore',
    'backbone', 
    'text!templates/common/setMucuaLocal.html',
], function($, _, Backbone, Index){
    var SetMucuaLocalView = Backbone.View.extend({
	render: function(){
	    $('#content').html(_.template(Index));
	    
	    $('#definirMucuaLocal').on('click', function() {
		mucuaLocal = $('#mucuaLocal')[0].value;
		console.log(mucuaLocal);
		$.cookie('bbxMucuaLocal', mucuaLocal, { expires: 30 });
		window.location.href  = '#mocambos/' + mucuaLocal + '/bbx/search/';
	    });
	},
    });			 
    return SetMucuaLocalView;
});