var async = require('async');

var StoreService = require('../services/StoreService');
var SettingService = require('../services/SettingService');
var FB = require('../services/FacebookService');

var AuthController = function() {}

AuthController.prototype.dashboardPage = function(req, res) {
  if (!req.session.user) {
    StoreService.random(3).then(function(stores) {
      res.render('home', {
        stores: stores
      });
    });
  } else {
    res.render('dashboard', {
      message: req.flash('message')
    });
  }
}

AuthController.prototype.authPage = function(req, res) {
  if (!req.session.user) {
    res.render('auth', {
      message: req.flash('message')
    });
  } else {
    res.redirect('/');
  }
}

AuthController.prototype.auth = function(req, res) {
  FB.extendAccessToken(req.body.access_token).then(function(accessToken) {
    if (!accessToken) {
      req.flash('message', 'Error while authenticating. If problem persist, please contact technical support.');

      res.redirect('/auth');
    } else {
      FB.me(accessToken).then(function(user) {
        if (!user) {
          req.flash('message', 'Error while authenticating. If problem persist, please contact technical support.');

          res.redirect('/auth');
        } else {
          req.session.user = user;

          if (req.session.lastPage) {
            var lastPage = req.session.lastPage;
            req.session.lastPage = null;

            res.redirect(lastPage);
          } else {
            FB.pages(accessToken).then(function(stores) {
              req.session.user.setStores(stores, {
                role: 'owner'
              }).then(function() {
                async.each(stores, function(store, cb) {
                  SettingService.createOrFind(req.session.user, store).spread(function(setting, created) {
                    cb();
                  });
                }, function() {
                  res.redirect('/');
                });
              });
            });
          }
        }
      });
    }
  });
}

AuthController.prototype.logout = function(req, res) {
  req.session.destroy();

  res.redirect('/');
}

module.exports = new AuthController();
