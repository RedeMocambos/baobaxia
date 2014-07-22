define([
    'jquery', 
    'underscore',
    'backbone',
    'text!templates/common/Index.html',
], function($, _, Backbone, IndexTpl){
    var HeaderView = Backbone.View.extend({
	render: function() {
	    $('#content').append(_.template(IndexTpl));
	}
    });
    return HeaderView;
});