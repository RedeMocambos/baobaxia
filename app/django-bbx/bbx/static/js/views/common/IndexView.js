define([
    'jquery', 
    'lodash',
    'backbone',
    'text!templates/' + BBX.userLang + '/common/Index.html',
], function($, _, Backbone, IndexTpl){
    var HeaderView = Backbone.View.extend({
	render: function() {
	    $('#content').append(_.template(IndexTpl));
	}
    });
    return HeaderView;
});
