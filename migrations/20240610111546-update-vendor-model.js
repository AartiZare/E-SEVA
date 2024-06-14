'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('vendors', 'company_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.removeColumn('vendors', 'dob');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('vendors', 'dob', {
      type: Sequelize.DATE,
      allowNull: false,
    });

    await queryInterface.removeColumn('vendors', 'company_name');
  }
};
