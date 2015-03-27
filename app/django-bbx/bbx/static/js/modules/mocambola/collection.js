define([
    'jquery',
    'backbone',
    'modules/mocambola/model'
], function($, Backbone, MucuaModel){
    var MocambolaModel = Backbone.Collection.extend({
	model: MocambolaModel,
	url: BBX.config.apiUrl + '/' + BBX.config.MYREPOSITORY + '/mocambola/'
    });
    return MocambolaModel;
});
