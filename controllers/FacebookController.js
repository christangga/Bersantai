var StoreService = require('../services/StoreService');
var CustomerMessageService = require('../services/CustomerMessageService');
var TM = require('../services/TemplateMatchingService');
var FB = require('../services/FacebookService');

var constant = require('../utils/constant');

var async = require('async');

var FacebookController = function() {}

FacebookController.prototype.webhookPage = function(req, res) {
  console.log('/webhook', req.query);

  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === constant.VERIFY_TOKEN) {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error('Failed validation. Make sure the validation tokens match.');

    res.sendStatus(403);
  }
}

FacebookController.prototype.webhook = function(req, res) {
  console.log('/webhook', JSON.stringify(req.body));

  var data = req.body;
  if (data.object == 'page') {
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.optin) {
          // receivedAuthentication(messagingEvent);
        } else if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          // receivedDeliveryConfirmation(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else {
          console.log('Webhook received unknown messagingEvent: ', messagingEvent);
        }
      });
    });

    res.sendStatus(200);
  }
}

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  var messageId = message.mid;
  var messageText = message.text;
  var messageAttachments = message.attachments;

  StoreService.id(recipientID.toString()).then(function(store) {
    FB.saveUserProfile(store.access_token, senderID);

    if (messageText) {
      var messageTexts = messageText.split('. ').filter(function(text) {
        return text != '';
      });
      async.eachSeries(messageTexts, function(messageText, cb) {
        CustomerMessageService.save(senderID, recipientID, messageText, timeOfMessage).then(function(customerMessage) {
          TM.match(senderID, store, messageText, function(response) {
            if (!response) {
              sendContactMessage(store.access_token, senderID, store);
              cb('No appropriate response found');
            } else {
              var message = {
                text: response.body
              }

              sendMessage(store.access_token, senderID, message);
              cb();
            }
          });
        });
      });
    } else if (messageAttachments) {
      sendContactMessage(store.access_token, senderID, store);
    }
  });
}

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  var payload = event.postback.payload;

  // CustomerMessageService.save(senderID, recipientID, JSON.stringify(event.postback), timeOfPostback);

  StoreService.id(recipientID.toString()).then(function(store) {
    FB.saveUserProfile(store.access_token, senderID);

    switch (payload) {
      case 'GET_STARTED':
        sendWelcomeMessage(store.access_token, senderID, store);
        break;

      case 'RANDOM_PRODUCTS':
        sendRandomProductsMessage(store.access_token, senderID, store);
        break;

      default:
        sendContactMessage(store.access_token, senderID, store);
    }
  });
}

function sendWelcomeMessage(pageAccessToken, recipientId, store) {
  store.getSetting().then(function(setting) {
    var messageData = {
      recipient: {
        id: recipientId
      },
      message: setting.welcome_message
    };

    FB.sendMessage(pageAccessToken, messageData);
  });
}

function sendRandomProductsMessage(pageAccessToken, recipientId, store) {
  store.getProducts({
    order: [
      models.sequelize.fn('random')
    ],
    limit: 5
  }).then(function(storeProducts) {
    var elements = [];
    storeProducts.forEach(function(product) {
      elements.push({
        title: product.name,
        subtitle: product.description,
        item_url: constant.HOME_URL + '/stores/' + store.id + '/' + product.id,
        image_url: constant.HOME_URL + '/uploads/' + product.photo,
        buttons: [{
          type: 'web_url',
          url: constant.HOME_URL + '/stores/' + store.id + '/' + product.id,
          title: 'See More'
        }]
      });
    });

    var messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: elements
          }
        }
      }
    }

    FB.sendMessage(pageAccessToken, messageData);
  });
}

function sendContactMessage(pageAccessToken, recipientId, store) {
  store.getSetting().then(function(setting) {
    var messageData = {
      recipient: {
        id: recipientId
      },
      message: setting.contact_message
    };

    FB.sendMessage(pageAccessToken, messageData);
  });
}

function sendMessage(pageAccessToken, recipientId, message) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: message
  };

  FB.sendMessage(pageAccessToken, messageData);
}

// function sendTextMessage(pageAccessToken, recipientId, messageText) {
//   var messageData = {
//     recipient: {
//       id: recipientId
//     },
//     message: {
//       text: messageText
//     }
//   };

//   FB.sendMessage(pageAccessToken, messageData);
// }

// function sendButtonMessage(pageAccessToken, recipientId, messageText) {
//   var messageData = {
//     recipient: {
//       id: recipientId
//     },
//     message: {
//       attachment: {
//         type: 'template',
//         payload: {
//           template_type: 'button',
//           text: messageText,
//           buttons: [{
//             type: 'web_url',
//             url: 'https://petersapparel.parseapp.com',
//             title: 'Show Website'
//           }, {
//             type: 'postback',
//             title: 'Start Chatting',
//             payload: 'USER_DEFINED_PAYLOAD'
//           }],
//         }
//       }
//     }
//   };

//   FB.sendMessage(pageAccessToken, messageData);
// }

// function sendGenericMessage(pageAccessToken, recipientId) {
//   var messageData = {
//     recipient: {
//       id: recipientId
//     },
//     message: {
//       attachment: {
//         type: 'template',
//         payload: {
//           template_type: 'generic',
//           elements: [{
//             title: 'rift',
//             subtitle: 'Next-generation virtual reality',
//             item_url: 'https://www.oculus.com/en-us/rift/',
//             image_url: 'http://messengerdemo.parseapp.com/img/rift.png',
//             buttons: [{
//               type: 'web_url',
//               url: 'https://www.oculus.com/en-us/rift/',
//               title: 'Open Web URL'
//             }, {
//               type: 'postback',
//               title: 'Call Postback',
//               payload: 'Payload for first bubble',
//             }],
//           }, {
//             title: 'touch',
//             subtitle: 'Your Hands, Now in VR',
//             item_url: 'https://www.oculus.com/en-us/touch/',
//             image_url: 'http://messengerdemo.parseapp.com/img/touch.png',
//             buttons: [{
//               type: 'web_url',
//               url: 'https://www.oculus.com/en-us/touch/',
//               title: 'Open Web URL'
//             }, {
//               type: 'postback',
//               title: 'Call Postback',
//               payload: 'Payload for second bubble',
//             }]
//           }]
//         }
//       }
//     }
//   };

//   FB.sendMessage(pageAccessToken, messageData);
// }

// function sendReceiptMessage(pageAccessToken, recipientId) {
//   var messageData = {
//     recipient: {
//       id: recipientId
//     },
//     message: {
//       'attachment': {
//         'type': 'template',
//         'payload': {
//           'template_type': 'receipt',
//           'recipient_name': 'Stephane Crozatier',
//           'order_number': '12345678902',
//           'currency': 'USD',
//           'payment_method': 'Visa 2345',
//           'order_url': 'http://petersapparel.parseapp.com/order?order_id=123456',
//           'timestamp': '1428444852',
//           'elements': [{
//             'title': 'Classic White T-Shirt',
//             'subtitle': '100% Soft and Luxurious Cotton',
//             'quantity': 2,
//             'price': 50,
//             'currency': 'USD',
//             'image_url': 'http://petersapparel.parseapp.com/img/whiteshirt.png',
//           }, {
//             'title': 'Classic Gray T-Shirt',
//             'subtitle': '100% Soft and Luxurious Cotton',
//             'quantity': 1,
//             'price': 25,
//             'currency': 'USD',
//             'image_url': 'http://petersapparel.parseapp.com/img/grayshirt.png'
//           }],
//           'address': {
//             'street_1': '1 Hacker Way',
//             'street_2': '',
//             'city': 'Menlo Park',
//             'postal_code': '94025',
//             'state': 'CA',
//             'country': 'US'
//           },
//           'summary': {
//             'subtotal': 75.00,
//             'shipping_cost': 4.95,
//             'total_tax': 6.19,
//             'total_cost': 56.14
//           },
//           'adjustments': [{
//             'name': 'New Customer Discount',
//             'amount': 20
//           }, {
//             'name': '$10 Off Coupon',
//             'amount': 10
//           }]
//         }
//       }
//     }
//   };

//   FB.sendMessage(pageAccessToken, messageData);
// }

module.exports = new FacebookController();
