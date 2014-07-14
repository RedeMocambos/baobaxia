define([
    'jquery', 
    'underscore',
    'backbone', 
    'modules/bbx/base-functions',
    'modules/media/media-functions',
    'modules/media/model',
    'text!templates/media/MediaPublish.html'
], function($, _, Backbone, BBXBaseFunctions, MediaFunctions, MediaModel, MediaPublishTpl){
    
    var MediaPublish = Backbone.View.extend({
	
	render: function(){
	    $('#content').html(_.template(MediaPublishTpl));
	}
    });
    
    return MediaPublish;
});