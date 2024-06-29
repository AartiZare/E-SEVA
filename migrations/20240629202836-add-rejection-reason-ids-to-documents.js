'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tbl_documents', 'issue_types', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
      defaultValue: [],
    });
    await queryInterface.addColumn('tbl_documents', 'other_reason', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.removeColumn('tbl_documents', 'rejection_reason_ids');
    await queryInterface.removeColumn('tbl_documents', 'rejection_other_reason');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tbl_documents', 'rejection_reason_ids', {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      allowNull: true,
      defaultValue: [],
    });
    await queryInterface.addColumn('tbl_documents', 'rejection_other_reason', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.removeColumn('tbl_documents', 'issue_types');
    await queryInterface.removeColumn('tbl_documents', 'other_reason');
  }
};
