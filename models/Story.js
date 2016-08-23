'use strict';

module.exports = function(sequelize, DataTypes) {
  var Story = sequelize.define('story', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    category: {
      allowNull: false,
      type: DataTypes.STRING
    },
    prerequisite_id: {
      allowNull: true,
      type: DataTypes.BIGINT,
      references: {
        model: 'stories',
        key: 'id'
      },
    },
    question: {
      allowNull: false,
      type: DataTypes.STRING
    },
    response: {
      allowNull: false,
      type: DataTypes.STRING
    }
  }, {
    classMethods: {
      associate: function(models) {
        Story.belongsToMany(models.store, {
          through: models.store_story
        });
        Story.belongsToMany(models.user, {
          through: models.user_story
        });
        Story.hasMany(models.story_report, {
          as: 'reports'
        });
      }
    },
    underscored: true
  });

  return Story;
};
