define([
    'jquery', 
    'lodash',
    'backbone',
    'text!/api/templates/' + userLang + '/common/Index.html',
], function($, _, Backbone, IndexTpl){
    var HeaderView = Backbone.View.extend({
	render: function() {
	    $('#content').append(_.template(IndexTpl));
	}
    });
    return HeaderView;
});
