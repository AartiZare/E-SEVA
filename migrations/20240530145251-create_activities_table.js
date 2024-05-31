'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('activities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Activity_title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      activity_description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      activity_created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      activity_created_by_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      activity_created_by_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      activity_document_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'documents',
          key: 'id'
        }
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('activities');
  }
};
