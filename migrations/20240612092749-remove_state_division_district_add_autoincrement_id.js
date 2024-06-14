'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove unnecessary columns
    await queryInterface.removeColumn('branches', 'stateId');
    await queryInterface.removeColumn('branches', 'divisionId');
    await queryInterface.removeColumn('branches', 'districtId');
    
    // Change id column properties
    await queryInterface.changeColumn('branches', 'id', {
      type: Sequelize.INTEGER,
      autoIncrement: false, // Remove auto-increment constraint temporarily
      allowNull: false, // Ensure id is not nullable
    });

    // Add new_id column with auto-increment primary key
    await queryInterface.addColumn('branches', 'new_id', {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    });

    // Copy data from id to new_id
    await queryInterface.sequelize.query('UPDATE branches SET new_id = id');

    // Remove old id column
    await queryInterface.removeColumn('branches', 'id');

    // Rename new_id to id
    await queryInterface.renameColumn('branches', 'new_id', 'id');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert changes in the down migration
    await queryInterface.addColumn('branches', 'stateId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'states',
        key: 'id',
      },
    });
    await queryInterface.addColumn('branches', 'divisionId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'divisions',
        key: 'id',
      },
    });
    await queryInterface.addColumn('branches', 'districtId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'districts',
        key: 'id',
      },
    });

    // Add back the old id column
    await queryInterface.addColumn('branches', 'new_id', {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: false,
      allowNull: false,
    });

    // Copy data from new_id to id
    await queryInterface.sequelize.query('UPDATE branches SET id = new_id');

    // Remove new_id column
    await queryInterface.removeColumn('branches', 'new_id');
  }
};
