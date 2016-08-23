'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('store_settings', {
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
      greeting_text: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      welcome_message: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      contact_message: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      tm_config: {
        allowNull: false,
        type: Sequelize.TEXT
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
    return queryInterface.dropTable('store_settings');
  }
};
