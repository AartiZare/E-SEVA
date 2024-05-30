'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('vendors', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      full_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      profile_image: {
        type: Sequelize.STRING
      },
      email_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      // Add other columns as per your model definition

      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles', // Name of the Roles table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // Adjust the onDelete behavior as needed
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('vendors');
  }
};
