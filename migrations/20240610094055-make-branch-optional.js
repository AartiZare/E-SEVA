'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ensure the temporary column does not already exist
    await queryInterface.sequelize.query(`
      ALTER TABLE users DROP COLUMN IF EXISTS branch_temp;
    `);

    // Add a new temporary column
    await queryInterface.addColumn('users', 'branch_temp', {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      allowNull: true,
      defaultValue: []
    });

    // Update the temporary column with converted data
    // Here we use a more robust way to handle the conversion
    await queryInterface.sequelize.query(`
      UPDATE users
      SET branch_temp = CASE
        WHEN branch = '' THEN ARRAY[]::INTEGER[]
        ELSE (
          SELECT ARRAY_AGG(CAST(trim(val) AS INTEGER))
          FROM unnest(string_to_array(branch, ',')) AS val
          WHERE trim(val) ~ '^[0-9]+$'
        )
      END
    `);

    // Remove the old column
    await queryInterface.removeColumn('users', 'branch');

    // Rename the temporary column to 'branch'
    await queryInterface.renameColumn('users', 'branch_temp', 'branch');
  },

  down: async (queryInterface, Sequelize) => {
    // Ensure the temporary column does not already exist
    await queryInterface.sequelize.query(`
      ALTER TABLE users DROP COLUMN IF EXISTS branch_temp;
    `);

    // Add a new temporary column with the old data type
    await queryInterface.addColumn('users', 'branch_temp', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Update the temporary column with converted data
    await queryInterface.sequelize.query(`
      UPDATE users
      SET branch_temp = array_to_string(branch, ',')
      WHERE branch IS NOT NULL
    `);

    // Remove the new column
    await queryInterface.removeColumn('users', 'branch');

    // Rename the temporary column to 'branch'
    await queryInterface.renameColumn('users', 'branch_temp', 'branch');
  }
};
