'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('store_stories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      store_id: {
        allowNull: false,
        type: Sequelize.STRING,
        references: {
          model: 'stores',
          key: 'id'
        },
      },
      story_id: {
        allowNull: false,
        type: Sequelize.BIGINT,
        references: {
          model: 'stories',
          key: 'id'
        },
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('store_stories');
  }
};
