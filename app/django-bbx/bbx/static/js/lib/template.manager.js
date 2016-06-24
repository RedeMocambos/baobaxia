/*
 * Idea taken from: https://lostechies.com/derickbailey/2012/02/09/asynchronously-load-html-templates-for-backbone-views/
 * Totally readapted by Fernão Lopes Ginez de Lara
 * 2016
 */

TemplateManager = {
    
    get: function(templateName, callback){
	// defines new global variable for templates, if not set
	if (typeof BBX.templates === 'undefined') {
	    BBX.templates = {};
	}
	
	var templateString = templateName.replace(/\//gi, '_'),
	    templateInstance = BBX.templates.hasOwnProperty[templateString];

	// already loaded: runs it
	if (typeof templateInstance !== 'undefined') {
	    callback(templateInstance);
	} else {

	    // not yet loaded: get it
	    $.get(templateName + '.html', function(templateContent) {
		// adds to loaded list
		BBX.templates[templateName.replace(/\//gi, '_')] = templateContent;
		
		callback(templateContent);
	    });
	}
    }
}
