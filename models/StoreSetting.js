'use strict';

module.exports = function(sequelize, DataTypes) {
  var StoreSetting = sequelize.define('store_setting', {
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
    greeting_text: {
      allowNull: true,
      type: DataTypes.TEXT
    },
    welcome_message: {
      allowNull: true,
      type: DataTypes.TEXT
    },
    contact_message: {
      allowNull: true,
      type: DataTypes.TEXT
    },
    tm_config: {
      allowNull: false,
      type: DataTypes.TEXT
    }
  }, {
    classMethods: {
      associate: function(models) {
        //
      }
    },
    underscored: true
  });

  return StoreSetting;
};
