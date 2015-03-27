define([
    'jquery',
    'backbone'
], function($, Backbone) {
    var MocambolaModel = Backbone.Model.extend({
	idAttribute: 'username',
	url: BBX.config.apiUrl + "/" + BBX.config.MYREPOSITORY + "/" + BBX.config.MYMUCUA + "/mocambola/"
    });
    
    return MocambolaModel;	
});
