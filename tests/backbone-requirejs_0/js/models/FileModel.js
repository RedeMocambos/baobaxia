define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var FileModel = Backbone.Model.extend({
	
	urlRoot: 'http://192.168.1.7:9080/api/view/whereis',
	defaults: {
	    path: '/home/befree/annex/redemocambos/gunga/'
	}
    });
    
    return FileModel;	
});