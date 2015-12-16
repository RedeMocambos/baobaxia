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
		    config: config,
		    parseFilterLink: BBXFunctions.parseFilterLink,
		    getLimit: MediaFunctions.getLimit
		}
		$('#header-bottom').prepend(_.template(BuscadorTpl, data));

		// adiciona css se nao tiver sido carregado
		if (_.isEmpty($('head').find('link[href="/css/textext.core.css"]'))) {
		    $('head').prepend('<link rel="stylesheet" href="/css/textext.core.css" type="text/css" />');		    
		    $('head').prepend('<link rel="stylesheet" href="/css/textext.plugin.tags.css" type="text/css" />');
		    $('head').prepend('<link rel="stylesheet" href="/css/textext.plugin.autocomplete.css" type="text/css" />');
		}
		
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

		// adiciona evento de definir limit
		$('#itens_per_page input').on('keydown', function(e) {
		    if (e.which === 13) {
			window.location = MediaFunctions.parseUrlSearch(MediaFunctions.__getTagsFromUrl());
		    }
		});
		
		// TODO: pegar valores da url
	    }
	}
    });
    return BuscadorView;
});
