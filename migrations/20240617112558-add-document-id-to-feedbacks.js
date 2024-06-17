'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('feedbacks', 'document_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'documents',
        key: 'id',
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('feedbacks', 'document_id');
  },
};
