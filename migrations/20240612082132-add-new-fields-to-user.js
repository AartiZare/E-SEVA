'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'is_deleted', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn('users', 'assignedStateId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'states',
        key: 'id',
      },
    });

    await queryInterface.addColumn('users', 'assignedDivisionId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'divisions',
        key: 'id',
      },
    });

    await queryInterface.addColumn('users', 'assignedDistrictId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'districts',
        key: 'id',
      },
    });

    await queryInterface.addColumn('users', 'assignedTalukId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'taluks',
        key: 'id',
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'is_deleted');
    await queryInterface.removeColumn('users', 'assignedStateId');
    await queryInterface.removeColumn('users', 'assignedDivisionId');
    await queryInterface.removeColumn('users', 'assignedDistrictId');
    await queryInterface.removeColumn('users', 'assignedTalukId');
  }
};
