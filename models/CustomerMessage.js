'use strict';

module.exports = function(sequelize, DataTypes) {
  var CustomerMessage = sequelize.define('customer_message', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    sender: {
      allowNull: false,
      type: DataTypes.STRING
    },
    recipient: {
      allowNull: false,
      type: DataTypes.STRING
    },
    message: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    timestamp: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    classMethods: {
      associate: function(models) {
        //
      }
    },
    timestamps: false,
    underscored: true
  });

  return CustomerMessage;
};
