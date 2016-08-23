var models  = require('../models');
var moment = require('moment');

var User = models.user;
var UserToken = models.user_token;

module.exports = function(req, res, next) {
  var authorization = req.get('Authorization');
  if (!authorization) {
    res.status(401).json('Unauthorized. Authorization is required.');
  } else {
    authorization = authorization.split(' ');
    if (authorization.length != 2) {
      res.status(401).json('Unauthorized. Authorization is required.');
    } else {
      UserToken.findOne({
        where: {
          access_token: authorization[1]
        }
      }).then(function(userToken) {
        if (!userToken) {
          res.status(401).json('Unauthorized. Authorization is required.');
        } else if (moment(userToken.expired_at).isBefore(moment())) {
          userToken.destroy(
          ).then(function() {
            res.status(401).json('Unauthorized. Authorization is required.');
          });
        } else {
          User.findOne({
            where: {
              id: userToken.user_id
            }
          }).then(function(user) {
            req.user = user;

            next();
          });
        }
      });
    }
  }
}
