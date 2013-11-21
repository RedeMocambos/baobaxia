define([
    'jquery',
    'underscore',
    'backbone',
    'modules/mucua/model'
], function($, _, Backbone, MucuaModel){
    var MucuaModel = Backbone.Collection.extend({
	model: MucuaModel
    });
    return MucuaModel;
});