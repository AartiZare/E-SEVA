'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('documents', 'document_type', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('documents', 'branch', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('documents', 'rejected_by_supervisor', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn('documents', 'rejected_by_squad', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn('documents', 'is_document_rejected', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('documents', 'document_type');
    await queryInterface.removeColumn('documents', 'branch');
    await queryInterface.removeColumn('documents', 'rejected_by_supervisor');
    await queryInterface.removeColumn('documents', 'rejected_by_squad');
    await queryInterface.removeColumn('documents', 'is_document_rejected');
  }
};
