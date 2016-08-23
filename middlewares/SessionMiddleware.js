var Models = require('../models');

var User = Models.user;

module.exports = function(req, res, next) {
  if (req.session && req.session.user) {
    User.findById(req.session.user.id).then(function(user) {
      if (!user) {
        req.session.destroy();

        res.render('auth', {
          message: 'You need to login to continue'
        });
      } else {
        req.session.user = user;

        next();
      }
    });
  } else {
    req.session.user = null;
    req.session.lastPage = req.originalUrl;

    res.render('auth', {
      message: 'You need to login to continue'
    });
  }
}
