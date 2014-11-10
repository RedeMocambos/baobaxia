define([
    'jquery',
    'backbone',
    'modules/mucua/model'
], function($, Backbone, MucuaModel){
    var MucuaModel = Backbone.Collection.extend({
	model: MucuaModel
    });
    return MucuaModel;
});
