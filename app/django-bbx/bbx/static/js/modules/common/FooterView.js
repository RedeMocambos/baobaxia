define([
    'jquery', 
    'underscore',
    'backbone',
    'text!templates/common/footer.html',
], function($, _, Backbone, Footer){
    var FooterView = Backbone.View.extend({
	render: function(data) {
	    $('#footer').append(Footer);  
	}
    });
    return FooterView;
});