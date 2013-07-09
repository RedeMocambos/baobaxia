define([
    'jquery', 
    'underscore',
    'backbone', 
    'models/FileModel',
    'text!templates/file/FileTemplate.html'
], function($, _, Backbone, FileModel, FileTemplate){
    
    var FileView = Backbone.View.extend({
	el: $('#content'),
	
	render: function(){
	    htmlOutput = this.model.toJSON();
	    var compiledTemplate = _.template(FileTemplate, htmlOutput);
	    this.$el.html(compiledTemplate);
	}

    });
    return FileView;
});