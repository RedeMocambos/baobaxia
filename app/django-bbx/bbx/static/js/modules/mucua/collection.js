define([
    'jquery',
    'backbone',
    'modules/mucua/model'
], function($, Backbone, MucuaModel){
    var MucuaModel = Backbone.Collection.extend({
	model: MucuaModel,
	url: BBX.config.apiUrl + '/' + BBX.config.MYREPOSITORY + '/mucuas'
    });
    return MucuaModel;
});
