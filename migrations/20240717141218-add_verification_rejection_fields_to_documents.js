'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tbl_documents', 'squad_verified_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'tbl_users',
        key: 'id',
      },
    });

    await queryInterface.addColumn('tbl_documents', 'supervisor_verified_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'tbl_users',
        key: 'id',
      },
    });

    await queryInterface.addColumn('tbl_documents', 'squad_rejected_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'tbl_users',
        key: 'id',
      },
    });

    await queryInterface.addColumn('tbl_documents', 'supervisor_rejected_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'tbl_users',
        key: 'id',
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('tbl_documents', 'squad_verified_by');
    await queryInterface.removeColumn('tbl_documents', 'supervisor_verified_by');
    await queryInterface.removeColumn('tbl_documents', 'squad_rejected_by');
    await queryInterface.removeColumn('tbl_documents', 'supervisor_rejected_by');
  }
};