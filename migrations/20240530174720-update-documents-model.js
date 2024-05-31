'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('documents', 'updated_by', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Name of the Users table
        key: 'id'
      }
    });

    await queryInterface.addColumn('documents', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    await queryInterface.addColumn('documents', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('documents', 'updated_by');
    await queryInterface.removeColumn('documents', 'createdAt');
    await queryInterface.removeColumn('documents', 'updatedAt');
  }
};
