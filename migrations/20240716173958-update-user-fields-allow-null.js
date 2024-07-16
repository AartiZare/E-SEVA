"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("tbl_users", "profile_image", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("tbl_users", "alternate_contact_number", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("tbl_users", "pan_number", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("tbl_users", "aadhaar_number", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("tbl_users", "qualification", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("tbl_users", "date_of_birth", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.changeColumn("tbl_users", "pincode", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("tbl_users", "district", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("tbl_users", "taluk", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("tbl_users", "village", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("tbl_users", "address", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("tbl_users", "bank_account_number", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("tbl_users", "password", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("tbl_users", "bank_ifsc", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("tbl_users", "bank_name", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("tbl_users", "reset_otp", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("tbl_users", "reset_otp_expiration", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.changeColumn("tbl_users", "bank_branch", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("tbl_users", "created_by", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.changeColumn("tbl_users", "status", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });
    await queryInterface.changeColumn("tbl_users", "resetPasswordToken", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("tbl_users", "resetPasswordTokenExpiry", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.changeColumn("tbl_users", "vendor_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.changeColumn("tbl_users", "is_active", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });
    await queryInterface.changeColumn("tbl_users", "is_deleted", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("tbl_users", "profile_image", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("tbl_users", "alternate_contact_number", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("tbl_users", "pan_number", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("tbl_users", "aadhaar_number", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("tbl_users", "qualification", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("tbl_users", "date_of_birth", {
      type: Sequelize.DATE,
      allowNull: false,
    });
    await queryInterface.changeColumn("tbl_users", "pincode", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("tbl_users", "district", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("tbl_users", "taluk", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("tbl_users", "village", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("tbl_users", "address", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("tbl_users", "bank_account_number", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("tbl_users", "password", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("tbl_users", "bank_ifsc", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("tbl_users", "bank_name", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("tbl_users", "reset_otp", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("tbl_users", "reset_otp_expiration", {
      type: Sequelize.DATE,
      allowNull: false,
    });
    await queryInterface.changeColumn("tbl_users", "bank_branch", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("tbl_users", "created_by", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.changeColumn("tbl_users", "status", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    });
    await queryInterface.changeColumn("tbl_users", "resetPasswordToken", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("tbl_users", "resetPasswordTokenExpiry", {
      type: Sequelize.DATE,
      allowNull: false,
    });
    await queryInterface.changeColumn("tbl_users", "vendor_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.changeColumn("tbl_users", "is_active", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    });
    await queryInterface.changeColumn("tbl_users", "is_deleted", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    });
  },
};