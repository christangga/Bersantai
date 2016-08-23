var async = require('async');

var StoreService = require('../services/StoreService');
var StoryService = require('../services/StoryService');
var SettingService = require('../services/SettingService');
var FB = require('../services/FacebookService');

var constant = require('../utils/constant');

var StoreController = function() {}

StoreController.prototype.storeCount = function(req, res) {
  StoreService.count().then(function(count) {
    res.status(200).json({
      count: count
    });
  });
}

StoreController.prototype.storePage = function(req, res) {
  req.session.user.getStores().then(function(stores) {
    res.render('stores/index', {
      message: req.flash('message'),
      stores: stores
    });
  });
}

StoreController.prototype.storeRefresh = function(req, res) {
  FB.pages(req.session.user.access_token).then(function(stores) {
    req.session.user.setStores(stores, {
      role: 'owner'
    }).then(function() {
      async.each(stores, function(store, cb) {
        SettingService.createOrFind(req.session.user, store).spread(function(setting, created) {
          cb();
        });
      }, function() {
        res.redirect('/stores');
      });
    });
  });
}

StoreController.prototype.storeDetailPage = function(req, res) {
  req.session.user.getStores({
    where: {
      id: req.params.store_id
    }
  }).then(function(stores) {
    if (stores.length == 0) {
      req.flash('message', 'Invalid store id');
      res.redirect('/stores');
    } else {
      var store = stores[0];

      store.getProducts().then(function(products) {
        products.forEach(function(product) {
          product.price = product.price.toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR'
          });
        });

        store.getStories().then(function(stories) {
          StoryService.all().then(function(allStories) {
            for (var i = 0; i < allStories.length; ++i) {
              var isFound = false;
              for (var j = 0; j < stories.length; ++j) {
                if (allStories[i].id == stories[j].id) {
                  allStories[i].is_checked = true;
                  break;
                }
              }
            }

            store.getSetting().then(function(setting) {
              var subscribe = false;
              FB.getSubscribedApps(store.access_token).then(function(subscribedApps) {
                var subscribedIds = subscribedApps.map(function(app) {
                  return app.id;
                });

                if (subscribedIds.indexOf(constant.APP_ID) >= 0) {
                  subscribe = true;
                }

                res.render('stores/products', {
                  message: req.flash('message'),
                  store: store,
                  products: products,
                  stories: stories,
                  setting: setting,
                  subscribe: subscribe,
                  all_stories: allStories
                });
              });
            });
          });
        });
      });
    }
  });
}

StoreController.prototype.updateStoreStories = function(req, res) {
  req.session.user.getStores({
    where: {
      id: req.params.store_id
    }
  }).then(function(stores) {
    if (stores.length == 0) {
      req.flash('message', 'Invalid store id');
      res.redirect('/stores');
    } else {
      var store = stores[0];

      store.setStories(
        req.body.stories ? req.body.stories : null
      ).then(function() {
        res.redirect('/stores/' + req.params.store_id);
      });
    }
  });
}

StoreController.prototype.updateStoreSetting = function(req, res) {
  req.session.user.getStores({
    where: {
      id: req.params.store_id
    }
  }).then(function(stores) {
    if (stores.length == 0) {
      req.flash('message', 'Invalid store id');

      res.redirect('/stores');
    } else {
      var store = stores[0];

      store.getSetting().then(function(setting) {
        setting.update(req.body).then(function() {
          if (req.body.subscribe == "active") {
            FB.subscribePage(store.access_token).then(function() {
              FB.setGreetingText(store.access_token, setting.greeting_text).then(function() {
                FB.setGetStartedButton(store.access_token).then(function() {
                  FB.setPersistentMenu(store.access_token).then(function() {
                    res.redirect('/stores/' + req.params.store_id);
                  });
                });
              });
            });
          } else {
            FB.deletePersistentMenu(store.access_token).then(function() {
              FB.deleteGetStartedButton(store.access_token).then(function() {
                FB.unsubscribePage(store.access_token).then(function() {
                  res.redirect('/stores/' + req.params.store_id);
                });
              });
            });
          }
        });
      });
    }
  });
}

module.exports = new StoreController();
