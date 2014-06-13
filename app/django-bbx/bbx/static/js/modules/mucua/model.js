define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var MucuaModel = Backbone.Model.extend({
	idAttribute: 'uuid'
    });
    
    return MucuaModel;	
});