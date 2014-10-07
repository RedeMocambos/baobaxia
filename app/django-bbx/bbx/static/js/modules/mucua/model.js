define([
    'jquery',
    'underscore',
    'backbone',
    'modules/media/model'
], function($, _, Backbone, MediaModel) {
    var MucuaModel = Backbone.Model.extend({
	idAttribute: 'uuid',

	/**
	 * Get mucua image:
	 *
	 * search on media if there's any media with it's uuid
	 *
	 * @return image
	 */
	getImage: function(url, callback, defaultImageSrc) {
	    var defaultImageSrc = defaultImageSrc || '/images/mucua-default.png',
	    media = new MediaModel([], {url: url});
	    media.fetch({
		success: function() {
		    var imageSrc = defaultImageSrc;
		    if(!_.isEmpty(media.attributes)) {
			if (media.attributes[0].is_local === true ) {
			    var mediaItem = media.attributes[0];
			    var url = BBX.config.apiUrl + '/' + BBX.config.repository + '/' + BBX.config.mucua + '/media/' + mediaItem.uuid + '/' + 150 + 'x' + 150 + '.' + mediaItem.format;
			    var mediaImage = new MediaModel([], {url: url});
			    mediaImage.fetch({
				success: function() {
				    if (typeof callback == 'function') {
					callback(mediaImage.attributes.url);
				    }			    
				}
			    })
			}
		    }
		}
	    });	
	}
    });
    
    return MucuaModel;	
});
