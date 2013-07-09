define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var FileModel = Backbone.Model.extend({
	urlRoot: "/api/view/whereis",
	idAttribute: "filename"
    });
    return FileModel;	
});