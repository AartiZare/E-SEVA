'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tbl_documents', 'approved_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('tbl_documents', 'rejected_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('tbl_documents', 'approved_at');
    await queryInterface.removeColumn('tbl_documents', 'rejected_at');
  }
};
