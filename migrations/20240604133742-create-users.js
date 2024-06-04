'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      full_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      profile_image: {
        type: Sequelize.STRING,
      },
      email_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contact_no: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      alt_contact_no: {
        type: Sequelize.STRING,
      },
      pan_no: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      adhar_no: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      qualifications: {
        type: Sequelize.STRING,
      },
      resetOTP: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
      },
      resetOTPExpiration: {
        type: Sequelize.DATE,
      },
      dob: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      pincode: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      district: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      taluk: {
        type: Sequelize.STRING,
      },
      village: {
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      account_no: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      branch: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: [],
        allowNull: false,
      },
      ifsc: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      bank_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      bank_branch: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      roleId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'roles', // name of Target model
          key: 'id', // key in Target model that we're referencing
        },
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  },
};
