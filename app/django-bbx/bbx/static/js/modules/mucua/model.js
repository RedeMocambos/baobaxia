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
	getImage: function(url, callback, defaultImageSrc, width, height) {
	    var width = width || 150,
	    height = height || 150,
	    defaultImageSrc = defaultImageSrc || '/images/mucua-default.png',
	    media = new MediaModel([], {url: url});
	    
	    media.fetch({
		success: function() {
		    var imageSrc = defaultImageSrc;
		    if(!_.isEmpty(media.attributes)) {
			if (media.attributes[0].is_local === true ) {
			    var mediaItem = media.attributes[0],
			    mucua = (BBX.config.mucua === '') ? BBX.config.MYMUCUA : mucua = BBX.config.mucua,
			    url = BBX.config.apiUrl + '/' + BBX.config.repository + '/' + mucua + '/media/' + mediaItem.uuid + '/' + width + 'x' + height + '.' + mediaItem.format,
			    mediaImage = new MediaModel([], {url: url});
			    
			    mediaImage.fetch({
				success: function() {
				    if (typeof callback == 'function') {
					callback(mediaImage.attributes.url);
				    }			    
				}
			    })
			}		
		    } else {
			// no image for mucua
			if (typeof callback == 'function') {
			    callback(defaultImageSrc);
			}			    
		    }		    
		}
	    });	
	}
    });
    
    return MucuaModel;	
});
