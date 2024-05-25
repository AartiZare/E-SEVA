'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'resetOTP', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'resetOTPExpiration', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'resetOTP');
    await queryInterface.removeColumn('users', 'resetOTPExpiration');
    await queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};
