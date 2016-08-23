var Models = require('../models');

var StoreProduct = Models.StoreProduct;

var StoreProductService = function() {}

StoreProductService.prototype.id = function(id) {
  return StoreProduct.findById(id);
}

module.exports = new StoreProductService();
