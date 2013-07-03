define([
    'jquery', 
    'underscore',
    'backbone', 
    'models/user',
    'text!templates/users/list.html'
], function($, _, Backbone, UserModel, userListTemplate){
    var UserListView = Backbone.View.extend({
	el: $('#content'),
	render: function(){
	    var data = {};
	    var compiledTemplate = _.template(userListView, data);
	    this.$el.append(compiledTemplate);
	}
    })
    return UserListView;
});