'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Example: Reapplying changes
    await queryInterface.changeColumn('tbl_vendors', 'full_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('tbl_vendors', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('tbl_vendors', 'contact_number', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('tbl_vendors', 'alternate_contact_number', {
      type: Sequelize.STRING,
      allowNull: true, // Example to allow null values
    });
    await queryInterface.changeColumn('tbl_vendors', 'pan_number', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('tbl_vendors', 'aadhaar_number', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('tbl_vendors', 'qualification', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('tbl_vendors', 'company_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('tbl_vendors', 'pincode', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('tbl_vendors', 'district', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('tbl_vendors', 'taluk', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('tbl_vendors', 'village', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('tbl_vendors', 'address', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('tbl_vendors', 'bank_account_number', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('tbl_vendors', 'bank_branch', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('tbl_vendors', 'bank_ifsc', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('tbl_vendors', 'bank_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('tbl_vendors', 'status', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('tbl_vendors', 'full_name', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('tbl_vendors', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('tbl_vendors', 'contact_number', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('tbl_vendors', 'alternate_contact_number', {
      type: Sequelize.STRING,
      allowNull: false, // Revert to NOT NULL constraint
    });
    await queryInterface.changeColumn('tbl_vendors', 'pan_number', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('tbl_vendors', 'aadhaar_number', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('tbl_vendors', 'qualification', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('tbl_vendors', 'company_name', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('tbl_vendors', 'pincode', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('tbl_vendors', 'district', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('tbl_vendors', 'taluk', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('tbl_vendors', 'village', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('tbl_vendors', 'address', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('tbl_vendors', 'bank_account_number', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('tbl_vendors', 'bank_branch', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('tbl_vendors', 'bank_ifsc', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('tbl_vendors', 'bank_name', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('tbl_vendors', 'status', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });
  },
};
