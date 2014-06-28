define([
    'jquery', 
    'underscore',
    'backbone',
    'text!templates/common/index.html',
], function($, _, Backbone, IndexTpl){
    var HeaderView = Backbone.View.extend({
	render: function() {
	    $('#content').append(_.template(IndexTpl));
	}
    });
    return HeaderView;
});