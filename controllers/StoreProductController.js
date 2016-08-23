var async = require('async');

var StoreProductService = require('../services/StoreProductService');

var StoreProductController = function() {}

StoreProductController.prototype.createStoreProduct = function(req, res) {
  req.session.user.getStores({
    where: {
      id: req.params.store_id
    }
  }).then(function(stores) {
    if (stores.length == 0) {
      req.flash('message', 'Invalid store id');
      res.redirect('/stores');
    } else {
      var store = stores[0];

      store.createProduct({
        name: req.body.name,
        description: req.body.description,
        color: req.body.color,
        category: req.body.category,
        size: req.body.size,
        photo: req.body.photo,
        price: req.body.price,
        quantity: req.body.quantity
      }).then(function(products) {
        res.redirect('/stores/' + req.params.store_id);
      });
    }
  });
}

StoreProductController.prototype.storeProductPage = function(req, res) {
  req.session.user.getStores({
    where: {
      id: req.params.store_id
    }
  }).then(function(stores) {
    if (!stores.length) {
      req.flash('message', 'Invalid store id');

      res.redirect('/stores');
    } else {
      var store = stores[0];
      store.getProducts({
        where: {
          id: req.params.product_id
        }
      }).then(function(products) {
        if (!products.length) {
          req.flash('message', 'Invalid product id');

          res.redirect('/stores/' + req.params.store_id);
        } else {
          var product = products[0];
          product.price = product.price.toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR'
          });

          res.render('stores/product', {
            message: req.flash('message'),
            product: product
          });
        }
      });
    }
  });
}

StoreProductController.prototype.updateStoreProduct = function(req, res) {
  req.session.user.getStores({
    where: {
      id: req.params.store_id
    }
  }).then(function(stores) {
    if (!stores.length) {
      req.flash('message', 'Invalid store id');

      res.redirect('/stores');
    } else {
      var store = stores[0];
      store.getProducts({
        where: {
          id: req.params.product_id
        }
      }).then(function(products) {
        if (!products.length) {
          req.flash('message', 'Invalid product id');

          res.redirect('/stores/' + req.params.store_id);
        } else {
          var product = products[0];

          product.update(req.body).then(function() {
            res.redirect('/stores/' + req.params.store_id + '/' + req.params.product_id);
          });
        }
      });
    }
  });
}

StoreProductController.prototype.deleteStoreProduct = function(req, res) {
  req.session.user.getStores({
    where: {
      id: req.params.store_id
    }
  }).then(function(stores) {
    if (!stores.length) {
      req.flash('message', 'Invalid store id');

      res.redirect('/stores');
    } else {
      var store = stores[0];
      store.getProducts({
        where: {
          id: req.params.product_id
        }
      }).then(function(products) {
        if (!products.length) {
          req.flash('message', 'Invalid product id');

          res.redirect('/stores/' + req.params.store_id);
        } else {
          var product = products[0];

          product.destroy().then(function() {
            res.redirect('/stores/' + req.params.store_id);
          });
        }
      });
    }
  });
}

module.exports = new StoreProductController();
