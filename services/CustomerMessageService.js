var models = require('../models');

var CustomerMessageService = function() {}

CustomerMessageService.prototype.save = function(senderId, recipientId, message, timestamp) {
  return models.customer_message.create({
    sender: senderId,
    recipient: recipientId,
    message: message,
    timestamp: timestamp
  });
}

module.exports = new CustomerMessageService();
