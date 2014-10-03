define([
    'jquery', 
    'underscore',
    'backbone',
    'text!templates/common/Sobre.html',
], function($, _, Backbone, SobreTpl){
    var SobreView = Backbone.View.extend({
	render: function() {
	    var config = BBX.config,
	    urlMucua = config.apiUrl +  '/mucua/by_name/' + config.mucua;
	    console.log('render sobre');
	    
	    if ($('#header-bottom').html() !== '') {
		$('#header-bottom').html('');
	    }
	    
	    BBXBaseFunctions.renderSidebar();
	    BBXBaseFunctions.renderUsage();
	    $('#content').html(_.template(SobreTpl));
	}
    });
    return SobreView;
});
