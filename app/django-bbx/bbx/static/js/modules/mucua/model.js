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
			    imageSrc = media.attributes[0].url;
			}
		    }
		    if (typeof callback == 'function') {
			callback(imageSrc);
		    }
		}
	    });	
	}
    });
    
    return MucuaModel;	
});
