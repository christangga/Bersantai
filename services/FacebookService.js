var request = require('request');
var constant = require('../utils/constant');
var models = require('../models');
var async = require('async');
var Q = require('q');

var User = models.user;
var Store = models.store;
var Customer = models.customer;

var FacebookService = function() {}

FacebookService.prototype._requestOptions = function(httpMethod, relativeUrl, queryString, requestBody) {
  var options = {
    method: httpMethod.toUpperCase(),
    baseUrl: constant.FACEBOOK_API_URL,
    url: relativeUrl,
    qs: queryString,
    body: requestBody,
    json: true
  };

  return options;
}

FacebookService.prototype.extendAccessToken = function(accessToken) {
  var deferred = Q.defer();

  request({
    method: 'GET',
    url: 'https://graph.facebook.com/oauth/access_token',
    qs: {
      client_id: constant.APP_ID,
      client_secret: constant.APP_SECRET,
      grant_type: 'fb_exchange_token',
      fb_exchange_token: accessToken
    }
  }, function(error, response, body) {
    console.log('/oauth/access_token', body);

    if (!error && response.statusCode == 200) {
      var messageId = body.id;

      deferred.resolve(body.replace('access_token=', ''));
    } else {
      console.error('Unable to extend access token.');

      deferred.resolve();
    }
  });

  return deferred.promise;
}

FacebookService.prototype.me = function(accessToken) {
  var deferred = Q.defer();

  var self = this;
  request(this._requestOptions('GET', '/me', {
    access_token: accessToken,
    fields: 'id,email,first_name,middle_name,last_name,link'
  }), function(error, response, body) {
    console.log('/me', body);

    if (!error && response.statusCode == 200) {
      request(self._requestOptions('GET', '/me/picture', {
        access_token: accessToken,
        redirect: 0,
        height: 2048
      }), function(error, response, body1) {
        console.log('/me/picture', body1);

        if (!error && response.statusCode == 200) {
          User.upsert({
            id: body.id,
            email: body.email,
            name: body.first_name + (body.middle_name ? ' ' + body.middle_name : '') + ' ' + body.last_name,
            profile_pic: body1.data.url,
            link: body.link,
            access_token: accessToken
          }).then(function(created) {
            User.findById(body.id).then(function(user) {
              deferred.resolve(user);
            });
          });
        } else {
          console.error('Unable to get user picture.');

          deferred.resolve();
        }
      });
    } else {
      console.error('Unable to get user profile.');

      deferred.resolve();
    }
  });

  return deferred.promise;
}

FacebookService.prototype.pages = function(accessToken) {
  var deferred = Q.defer();

  var self = this;
  request(this._requestOptions('GET', '/me/accounts', {
    access_token: accessToken,
    fields: 'id,name,category,about,description,link,access_token'
  }), function(error, response, body) {
    console.log('/me/accounts', body);

    if (!error && response.statusCode == 200) {
      var stores = [];
      async.each(body.data, function(page, cb) {
        request(self._requestOptions('GET', '/' + page.id + '/picture', {
          redirect: 0,
          height: 2048
        }), function(error, response, body1) {
          console.log('/' + page.id + '/picture', body1);

          if (!error && response.statusCode == 200) {
            Store.upsert({
              id: page.id,
              name: page.name,
              category: page.category,
              about: page.about,
              description: page.description,
              profile_pic: body1.data.url,
              access_token: page.access_token,
              link: page.link
            }).then(function(created) {
              Store.findById(page.id).then(function(store) {
                stores.push(store);

                cb();
              });
            });
          } else {
            console.error('Unable to get page picture.');

            deferred.resolve();
          }
        });
      }, function() {
        deferred.resolve(stores);
      });
    } else {
      console.error('Unable to get pages profile.');

      deferred.resolve();
    }
  });

  return deferred.promise;
}

FacebookService.prototype.sendPostAsPage = function(pageAccessToken, pageId, messageData) {
  var deferred = Q.defer();

  request(this._requestOptions('POST', '/' + pageId + '/feed', {
    access_token: pageAccessToken
  }, {
    message: messageData
  }), function(error, response, body) {
    console.log('/' + pageId + '/feed', body);

    if (!error && response.statusCode == 200) {
      deferred.resolve();
    } else {
      console.error('Unable to send post.');

      deferred.resolve();
    }
  });

  return deferred.promise;
}

FacebookService.prototype.saveUserProfile = function(pageAccessToken, userId) {
  var deferred = Q.defer();

  request(this._requestOptions('GET', '/' + userId, {
    access_token: pageAccessToken,
    fields: 'first_name,last_name,gender,profile_pic'
  }), function(error, response, body) {
    console.log('/' + userId, body);

    if (!error && response.statusCode == 200) {
      Customer.upsert({
        id: userId,
        name: body.first_name + ' ' + body.last_name,
        gender: body.gender,
        profile_pic: body.profile_pic
      }).then(function(created) {
        deferred.resolve();
      });
    } else {
      console.error('Unable to save user profile.');

      deferred.resolve();
    }
  });

  return deferred.promise;
}

FacebookService.prototype.getSubscribedApps = function(pageAccessToken) {
  var deferred = Q.defer();

  request(this._requestOptions('GET', '/me/subscribed_apps', {
    access_token: pageAccessToken
  }), function(error, response, body) {
    console.log('/me/subscribed_apps', body);

    if (!error && response.statusCode == 200) {
      deferred.resolve(body.data);
    } else {
      console.error('Unable to get subscribed apps.');

      deferred.resolve();
    }
  });

  return deferred.promise;
}

FacebookService.prototype.subscribePage = function(pageAccessToken) {
  var deferred = Q.defer();

  request(this._requestOptions('POST', '/me/subscribed_apps', {
    access_token: pageAccessToken
  }), function(error, response, body) {
    console.log('/me/subscribed_apps', body);

    if (!error && response.statusCode == 200) {
      deferred.resolve();
    } else {
      console.error('Unable to subscribe page.');

      deferred.resolve();
    }
  });

  return deferred.promise;
}

FacebookService.prototype.unsubscribePage = function(pageAccessToken) {
  var deferred = Q.defer();

  request(this._requestOptions('DELETE', '/me/subscribed_apps', {
    access_token: pageAccessToken
  }), function(error, response, body) {
    console.log('/me/subscribed_apps', body);

    if (!error && response.statusCode == 200) {
      deferred.resolve();
    } else {
      console.error('Unable to unsubscribe page.');

      deferred.resolve();
    }
  });

  return deferred.promise;
}

FacebookService.prototype.setGreetingText = function(pageAccessToken, text) {
  var deferred = Q.defer();

  request(this._requestOptions('POST', '/me/thread_settings', {
    access_token: pageAccessToken
  }, {
    setting_type: 'greeting',
    greeting: {
      text: text
    }
  }), function(error, response, body) {
    console.log('/me/thread_settings', body);

    if (!error && response.statusCode == 200) {
      deferred.resolve();
    } else {
      console.error('Unable to set greeting text.');

      deferred.resolve();
    }
  });

  return deferred.promise;
}

FacebookService.prototype.setGetStartedButton = function(pageAccessToken) {
  var deferred = Q.defer();

  request(this._requestOptions('POST', '/me/thread_settings', {
    access_token: pageAccessToken
  }, {
    setting_type: 'call_to_actions',
    thread_state: 'new_thread',
    call_to_actions: [{
      payload: 'GET_STARTED'
    }]
  }), function(error, response, body) {
    console.log('/me/thread_settings', body);

    if (!error && response.statusCode == 200) {
      deferred.resolve();
    } else {
      console.error('Unable to set get started button.');

      deferred.resolve();
    }
  });

  return deferred.promise;
}

FacebookService.prototype.deleteGetStartedButton = function(pageAccessToken) {
  var deferred = Q.defer();

  request(this._requestOptions('DELETE', '/me/thread_settings', {
    access_token: pageAccessToken
  }, {
    setting_type: 'call_to_actions',
    thread_state: 'new_thread'
  }), function(error, response, body) {
    console.log('/me/thread_settings', body);

    if (!error && response.statusCode == 200) {
      deferred.resolve();
    } else {
      console.error('Unable to delete get started button.');

      deferred.resolve();
    }
  });

  return deferred.promise;
}

FacebookService.prototype.setPersistentMenu = function(pageAccessToken) {
  var deferred = Q.defer();

  request(this._requestOptions('POST', '/me/thread_settings', {
    access_token: pageAccessToken
  }, {
    setting_type: 'call_to_actions',
    thread_state: 'existing_thread',
    call_to_actions: [{
      "type": "postback",
      "title": "Lapor Pertanyaan",
      "payload": "HELP"
    }, {
      "type": "postback",
      "title": "Lapor Pertanyaan",
      "payload": "REPORT_STORY"
    }, {
      "type": "postback",
      "title": "Start a New Order",
      "payload": "VIEW_CART"
    }, {
      "type": "postback",
      "title": "Start a New Order",
      "payload": "VIEW_ORDER"
    }, {
      "type": "postback",
      "title": "Start a New Order",
      "payload": "VIEW_PAYMENT"
    }]
  }), function(error, response, body) {
    console.log('/me/thread_settings', body);

    if (!error && response.statusCode == 200) {
      deferred.resolve();
    } else {
      console.error('Unable to set greeting message.');

      deferred.resolve();
    }
  });

  return deferred.promise;
}

FacebookService.prototype.deletePersistentMenu = function(pageAccessToken) {
  var deferred = Q.defer();

  request(this._requestOptions('DELETE', '/me/thread_settings', {
    access_token: pageAccessToken
  }, {
    setting_type: 'call_to_actions',
    thread_state: 'existing_thread'
  }), function(error, response, body) {
    console.log('/me/thread_settings', body);

    if (!error && response.statusCode == 200) {
      deferred.resolve();
    } else {
      console.error('Unable to delete persistent menu.');

      deferred.resolve();
    }
  });

  return deferred.promise;
}

FacebookService.prototype.sendMessage = function(pageAccessToken, messageData) {
  var deferred = Q.defer();

  request(this._requestOptions('POST', '/me/messages', {
    access_token: pageAccessToken
  }, messageData), function(error, response, body) {
    console.log('/me/messages', body);

    if (!error && response.statusCode == 200) {
      deferred.resolve();
    } else {
      console.error('Unable to send message.');

      deferred.resolve();
    }
  });

  return deferred.promise;
}

module.exports = new FacebookService();
