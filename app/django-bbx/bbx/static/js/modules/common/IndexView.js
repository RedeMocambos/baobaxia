define([
    'jquery', 
    'underscore',
    'backbone', 
    'modules/bbx/base-functions',
    'text!templates/common/index.html',
], function($, _, Backbone, BBXBaseFunctions, Index){
    var IndexView = Backbone.View.extend({
	render: function(data){
	    $('#content').html(_.template(Index, data));	    
	},
    });			 
    return IndexView;
});