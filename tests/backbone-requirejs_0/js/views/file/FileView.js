define([
    'jquery', 
    'underscore',
    'backbone', 
    'models/FileModel',
    'views/file/FileView',
    'text!templates/file/FileTemplate.html'
], function($, _, Backbone, FileModel, FileTemplate){
    var FileView = Backbone.View.extend({
	el: $('#content'),
	
	render: function(){
	    this.$el.html(FileTemplate);
	}

    });
    return FileView;
});