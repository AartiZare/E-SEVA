'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('activities', 'activity_document_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'documents',
        key: 'id'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('activities', 'activity_document_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'documents',
        key: 'id'
      }
    });
  }
};
