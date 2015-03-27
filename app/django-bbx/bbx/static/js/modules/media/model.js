define([
    'jquery',
    'backbone'
], function($, Backbone) {
    var MediaModel = Backbone.Model.extend({
	idAttribute: 'uuid',
	url: BBX.config.apiUrl + '/' + BBX.config.MYREPOSITORY + '/' + BBX.mucua + '/media/'
    });
    
    return MediaModel;	
});
