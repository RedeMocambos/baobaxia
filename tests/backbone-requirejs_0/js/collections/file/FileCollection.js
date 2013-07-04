define([
  'jquery',
  'underscore',
  'backbone',
  'models/FileModel'
], function($, _, Backbone, FileModel){
  var Files = Backbone.Collection.extend({
      model: FileModel,
      url: 'http://192.168.1.7:9080/api/view/whereis'
  });

  return Files;
});