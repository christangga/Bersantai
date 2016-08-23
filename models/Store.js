'use strict';

module.exports = function(sequelize, DataTypes) {
  var Store = sequelize.define('store', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING
    },
    category: {
      allowNull: true,
      type: DataTypes.STRING
    },
    about: {
      allowNull: true,
      type: DataTypes.STRING
    },
    description: {
      allowNull: true,
      type: DataTypes.STRING
    },
    profile_pic: {
      allowNull: true,
      type: DataTypes.STRING
    },
    access_token: {
      allowNull: false,
      type: DataTypes.STRING
    },
    link: {
      allowNull: true,
      type: DataTypes.STRING
    }
  }, {
    classMethods: {
      associate: function(models) {
        Store.belongsToMany(models.user, {
          through: models.user_store,
          as: 'users'
        });

        Store.hasOne(models.store_setting, {
          as: 'setting'
        });
        Store.hasMany(models.store_product, {
          as: 'products'
        });

        Store.belongsToMany(models.story, {
          through: models.store_story
        });
      }
    },
    underscored: true
  });

  return Store;
};
