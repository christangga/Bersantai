'use strict';

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('user', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING
    },
    profile_pic: {
      allowNull: false,
      type: DataTypes.STRING
    },
    link: {
      allowNull: false,
      type: DataTypes.STRING
    },
    access_token: {
      allowNull: false,
      type: DataTypes.TEXT
    }
  }, {
    classMethods: {
      associate: function(models) {
        User.hasOne(models.user_token, {
          as: 'token'
        });

        User.belongsToMany(models.store, {
          through: models.user_store,
          as: 'stores'
        });

        User.belongsToMany(models.story, {
          through: models.user_story
        });
      }
    },
    underscored: true
  });

  return User;
};
