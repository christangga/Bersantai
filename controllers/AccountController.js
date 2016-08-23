var AccountController = function() {}

AccountController.prototype.accountPage = function(req, res) {
  res.render('account/index', {
    message: req.flash('message'),
    user: req.session.user
  });
}

module.exports = new AccountController();
