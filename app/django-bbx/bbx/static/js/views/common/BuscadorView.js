define([
    'jquery', 
    'lodash',
    'backbone',
     'modules/media/functions',
    'text!/templates/' + BBX.userLang + '/common/Buscador.html',
    'textext_tags',
], function($, _, Backbone, MediaFunctions, BuscadorTpl, TextextTags){
    var BuscadorView = Backbone.View.extend({
	render: function(data) {
	    console.log('buscador');
	    var config = BBX.config,
		tags = MediaFunctions.__getTagsFromUrl(),
		validSearchOptions = MediaFunctions.__getValidSearchOptions(),
		currentUrl = Backbone.history.location.href;
	    
	    _.each(tags, function(tag) {
		$("body").addClass(tag);	  
	    });

	    // adiciona / remove opcoes de busca
	    var toggleSearchOption = function(validSearchOptions, el) {
		var searchOption = el.target.id,
		    action = null;

		if (!currentUrl.match('search')) {
		    currentUrl += '/bbx/search';
		}
		
		if (!$('#' + searchOption).hasClass('active')) {
		    if (_.contains(validSearchOptions, searchOption)) {
			var urlFragments = currentUrl.split('search');
			currentUrl = urlFragments[0] + 'search/' + searchOption;
			if (urlFragments.length > 1) {
			    currentUrl += urlFragments[1];
			}
		    }
		} else {
		    currentUrl = currentUrl.replace('/' + searchOption, '');
		}
		window.location.href = currentUrl;
	    }
	    
	    if ($('#buscador').html() == "" ||
		(typeof $('#buscador').html() === "undefined")) {
		var data = {
		    config: config
		}
		$('#header-bottom').prepend(_.template(BuscadorTpl, data));
		$('head').append('<link rel="stylesheet" href="/css/textext.core.css" type="text/css" />');		    
		$('head').append('<link rel="stylesheet" href="/css/textext.plugin.tags.css" type="text/css" />');
		$('head').append('<link rel="stylesheet" href="/css/textext.plugin.autocomplete.css" type="text/css" />');

		// adiciona eventos de search options
		_.each(validSearchOptions, function(searchOption) {
		    var target = '#' + searchOption;
		    $(target).on('click', function(el) {toggleSearchOption(validSearchOptions, el)});
		    if (currentUrl.match(searchOption)) {
			$(target).addClass('active');
		    } else {
			$(target).removeClass('active');
		    }
		});
		
		// TODO: pegar valores da url
	    }
	}
    });
    return BuscadorView;
});
