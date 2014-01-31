define([
    'jquery', 
    'underscore',
    'backbone',
    'text!templates/common/header.html',
], function($, _, Backbone, Header){
    var HeaderView = Backbone.View.extend({
	render: function(data) {
	    $('#header').append(_.template(Header, data));
	}
    });
    return HeaderView;
});