// Filename: app.js
define([
    'jquery',
    'lodash',
    'backbone',
    'router',
    'backbone_subroute',
], function($, _, Backbone, Router, BackboneSubroute){
    
    var initialize = function(){
	Router.initialize();
    };
    
    return {
	initialize: initialize
    };
});
