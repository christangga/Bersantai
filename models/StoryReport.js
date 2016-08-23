'use strict';

module.exports = function(sequelize, DataTypes) {
  var StoryReport = sequelize.define('story_report', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    story_id: {
      allowNull: false,
      type: DataTypes.BIGINT,
      references: {
        model: 'stories',
        key: 'id'
      },
    },
    description: {
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

  return StoryReport;
};
