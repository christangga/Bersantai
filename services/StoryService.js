var models = require('../models');

var story = models.story

var StoryServiceService = function() {}

StoryServiceService.prototype.all = function() {
  return models.story.findAll();
}

module.exports = new StoryServiceService();
