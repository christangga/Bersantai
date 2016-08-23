var express = require('express');

var router = express.Router();

var settingPage = function(req, res) {
  req.session.user.getStores().then(function(stores) {
    res.render('settings/index', {
      message: req.flash('message'),
      stores: stores
    });
  });
}

var updateSetting = function(req, res) {
  req.session.user.getStores({
    where: {
      id: req.body.store_id
    }
  }).then(function(stores) {
    if (!stores.length) {
      req.flash('message', 'Invalid store id');

      res.redirect('/settings');
    } else {
      stores[0].update({
        matching_method: req.body.matching_method
      }).then(function(affected) {
        res.redirect('/settings');
      });
    }
  });
}

router.get('/', settingPage);

router.post('/', updateSetting);

module.exports = router;
