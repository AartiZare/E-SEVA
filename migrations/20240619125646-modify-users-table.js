'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove columns
    await queryInterface.removeColumn('tbl_users', 'passwordResetToken');
    await queryInterface.removeColumn('tbl_users', 'passwordResetTokenExpiry');

    // Add columns
    await queryInterface.addColumn('tbl_users', 'resetPasswordToken', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('tbl_users', 'resetPasswordTokenExpiry', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Add columns
    await queryInterface.addColumn('tbl_users', 'passwordResetToken', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('tbl_users', 'passwordResetTokenExpiry', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Remove columns
    await queryInterface.removeColumn('tbl_users', 'resetPasswordToken');
    await queryInterface.removeColumn('tbl_users', 'resetPasswordTokenExpiry');
  }
};
