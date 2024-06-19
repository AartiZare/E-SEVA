'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add columns
    await queryInterface.addColumn('tbl_vendors', 'resetPasswordToken', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('tbl_vendors', 'resetPasswordTokenExpiry', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove columns
    await queryInterface.removeColumn('tbl_vendors', 'resetPasswordToken');
    await queryInterface.removeColumn('tbl_vendors', 'resetPasswordTokenExpiry');
  }
};
