'use strict';

module.exports = function(sequelize, DataTypes) {
  var StoreProduct = sequelize.define('store_product', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    store_id: {
      allowNull: false,
      type: DataTypes.STRING,
      references: {
        model: 'stores',
        key: 'id'
      },
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING
    },
    description: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    category: {
      allowNull: false,
      type: DataTypes.STRING
    },
    size: {
      allowNull: false,
      type: DataTypes.STRING
    },
    color: {
      allowNull: true,
      type: DataTypes.STRING
    },
    photo: {
      allowNull: true,
      type: DataTypes.STRING
    },
    price: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    quantity: {
      allowNull: false,
      type: DataTypes.INTEGER
    }
  }, {
    classMethods: {
      associate: function(models) {
        //
      }
    },
    underscored: true
  });

  return StoreProduct;
};
