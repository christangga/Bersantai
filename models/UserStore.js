'use strict';

module.exports = function(sequelize, DataTypes) {
  var UserStore = sequelize.define('user_store', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    user_id: {
      allowNull: false,
      type: DataTypes.STRING,
      references: {
        model: 'users',
        key: 'id'
      },
    },
    store_id: {
      allowNull: false,
      type: DataTypes.STRING,
      references: {
        model: 'stores',
        key: 'id'
      },
    },
    role: {
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

  return UserStore;
};
