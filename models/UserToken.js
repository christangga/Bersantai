'use strict';

module.exports = function(sequelize, DataTypes) {
  var UserToken = sequelize.define('user_token', {
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
    access_token: {
      allowNull: false,
      type: DataTypes.STRING
    },
    expired_at: {
      allowNull: false,
      type: DataTypes.DATE
    },
    refresh_token: {
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

  return UserToken;
};
