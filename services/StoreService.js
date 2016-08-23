var Models = require('../models');

var Store = Models.store;

var StoreService = function() {}

StoreService.prototype.random = function(limit) {
  return Store.findAll({
    order: [
      Models.sequelize.fn('random')
    ],
    limit: limit
  });
}

StoreService.prototype.id = function(id) {
  return Store.findById(id);
}

StoreService.prototype.count = function() {
  return Store.count();
}

module.exports = new StoreService();
