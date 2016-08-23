'use strict';

module.exports = function(sequelize, DataTypes) {
  var StoreStory = sequelize.define('store_story', {
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
    story_id: {
      allowNull: false,
      type: DataTypes.BIGINT,
      references: {
        model: 'stories',
        key: 'id'
      },
    }
  }, {
    classMethods: {
      associate: function(models) {
        //
      }
    },
    underscored: true
  });

  return StoreStory;
};
