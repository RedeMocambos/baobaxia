define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/bbx/base-functions',
    'modules/mucua/model',
    'modules/mucua/collection',
    'modules/mocambola/model',
    'json!config.json',
    'text!templates/auth/LoginTemplate.html',
], function($, _, Backbone, BBXBaseFunctions, MucuaModel, MucuaCollection, MocambolaModel, Config, LoginTemplate){
    var MucuaView = Backbone.View.extend({
	el: "body",
	
	render: function() {
	    console.log('home da mucua');
	    $('#content').html('Home da mucua');
	    //$('#footer').before(_.template(SidebarTpl));
	    
	    // usage data - mucua footer
	    // TODO: get from mucua / git annex
	    var usageData = {
		total: 260,
		used: 100,
		demanded: 20
	    }	    
	    BBXBaseFunctions.renderUsage(usageData);
	}
    });
    
    return MucuaView;
});