define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var FileModel = Backbone.Model.extend({
	urlRoot: "http://localhost:9080/api/view/whereis",
	idAttribute: "filename"
    });
    return FileModel;	
});