'use strict';

module.exports = function(sequelize, DataTypes) {
  var UserStory = sequelize.define('user_story', {
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

  return UserStory;
};
