var StoryController = function() {}

StoryController.prototype.storyPage = function(req, res) {
  req.session.user.getStories().then(function(stories) {
    res.render('stories/index', {
      message: req.flash('message'),
      stories: stories
    });
  });
}

StoryController.prototype.createStory = function(req, res) {
  req.session.user.createStory({
    category: req.body.category,
    question: req.body.question,
    prerequisite_id: req.body.prerequisite_id ? req.body.prerequisite_id : null,
    response: req.body.response
  }).then(function(story) {
    res.redirect('/stories');
  });
}

StoryController.prototype.updateStoryPage = function(req, res) {
  req.session.user.getStories().then(function(stories) {
    if (stories.length == 0) {
      req.flash('message', 'Invalid story id');

      res.redirect('/stories');
    } else {
      var story = null;
      stories.forEach(function(item, i, stories) {
        if (item.id == req.params.story_id) {
          story = item;
          stories.splice(i, 1);
        }
      });

      if (!story) {
        req.flash('message', 'Invalid story id');

        res.redirect('/stories');
      } else {
        story.getStores().then(function(stores) {
          res.render('stories/stores', {
            message: req.flash('message'),
            story: story,
            stores: stores,
            prerequisite_stories: stories
          });
        });
      }
    }
  });
}

StoryController.prototype.updateStory = function(req, res) {
  req.session.user.getStories({
    where: {
      id: req.params.story_id
    }
  }).then(function(stories) {
    if (stories.length == 0) {
      req.flash('message', 'Invalid story id');

      res.redirect('/stories');
    } else {
      stories[0].update({
        category: req.body.category,
        prerequisite_id: req.body.prerequisite_id ? req.body.prerequisite_id : null,
        question: req.body.question,
        response: req.body.response
      }).then(function(story) {
        res.redirect('/stories');
      });
    }
  });
}

StoryController.prototype.storyReports = function(req, res) {
  req.session.user.getStories({
    where: {
      id: req.params.story_id
    }
  }).then(function(stories) {
    if (stories.length == 0) {
      req.flash('message', 'Invalid story id');
      res.redirect('/stories');
    } else {
      stories[0].getReports().then(function(reports) {
        res.render('stories/reports', {
          reports: reports
        });
      });
    }
  });
}

module.exports = new StoryController();
