'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('stories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      category: {
        allowNull: false,
        type: Sequelize.STRING
      },
      prerequisite_id: {
        allowNull: true,
        type: Sequelize.STRING,
        references: {
          model: 'stores',
          key: 'id'
        },
      },
      question: {
        allowNull: false,
        type: Sequelize.STRING
      },
      response: {
        allowNull: false,
        type: Sequelize.STRING
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
    return queryInterface.dropTable('stories');
  }
};
