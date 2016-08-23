'use strict';

module.exports = function(sequelize, DataTypes) {
  var Customer = sequelize.define('customer', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING
    },
    gender: {
      allowNull: false,
      type: DataTypes.STRING
    },
    profile_pic: {
      allowNull: false,
      type: DataTypes.STRING
    }
  }, {
    classMethods: {
      associate: function(models) {
        //
      }
    },
    underscored: true
  });

  return Customer;
};
