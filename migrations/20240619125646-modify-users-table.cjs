'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // tbl_user_roles (needed early because other tables reference it)
      await queryInterface.createTable('tbl_states', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      status: { type: Sequelize.BOOLEAN, defaultValue: true },
      is_deleted: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
    await queryInterface.createTable('tbl_divisions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      state_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tbl_states',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: { type: Sequelize.BOOLEAN, defaultValue: true },
      is_deleted: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
   

    await queryInterface.createTable('tbl_user_roles', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: Sequelize.STRING,
      complete_access: { type: Sequelize.BOOLEAN, defaultValue: false },
      status: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
    await queryInterface.createTable('tbl_districts', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      division_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tbl_divisions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: { type: Sequelize.BOOLEAN, defaultValue: true },
      is_deleted: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
    
    await queryInterface.createTable('tbl_taluks', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      district_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tbl_districts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: { type: Sequelize.BOOLEAN, defaultValue: true },
      is_deleted: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
await queryInterface.createTable('tbl_documents', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      image_pdf: { type: Sequelize.STRING },
      document_name: { type: Sequelize.STRING, allowNull: false },
      document_reg_no: { type: Sequelize.STRING, allowNull: false },
      document_unique_id: { type: Sequelize.STRING },
      document_reg_date: { type: Sequelize.DATE, allowNull: false },
      document_renewal_date: { type: Sequelize.DATE, allowNull: false },
      total_no_of_page: { type: Sequelize.INTEGER },
      authorised_persons: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
      created_by: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'tbl_users', key: 'id' } },
      updated_by: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'tbl_users', key: 'id' } },
      document_type: { type: Sequelize.STRING },
      branch_id: { type: Sequelize.INTEGER },
      squad_verified_by: { type: Sequelize.INTEGER },
      supervisor_verified_by: { type: Sequelize.INTEGER },
      squad_rejected_by: { type: Sequelize.INTEGER },
      supervisor_rejected_by: { type: Sequelize.INTEGER },
      supervisor_verification_status: { type: Sequelize.INTEGER, defaultValue: 0 },
      squad_verification_status: { type: Sequelize.INTEGER, defaultValue: 0 },
      final_verification_status: { type: Sequelize.INTEGER, defaultValue: 0 },
      status: { type: Sequelize.BOOLEAN, defaultValue: true },
      document_upload_status: { type: Sequelize.STRING, defaultValue: 'false' },
      document_created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      approved_at: { type: Sequelize.DATE, allowNull: true },
      rejected_at: { type: Sequelize.DATE, allowNull: true },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
    // tbl_vendors (referenced by tbl_users)
    await queryInterface.createTable('tbl_vendors', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      full_name: { type: Sequelize.STRING, allowNull: false },
      profile_image: Sequelize.STRING,
      email: { type: Sequelize.STRING, allowNull: false },
      contact_number: { type: Sequelize.STRING, allowNull: false },
      alternate_contact_number: Sequelize.STRING,
      pan_number: Sequelize.STRING,
      aadhaar_number: Sequelize.STRING,
      qualification: Sequelize.STRING,
      reset_otp: Sequelize.STRING,
      password: Sequelize.STRING,
      reset_otp_expiration: Sequelize.DATE,
      pincode: Sequelize.STRING,
      district: Sequelize.STRING,
      taluk: Sequelize.STRING,
      village: Sequelize.STRING,
      address: Sequelize.STRING,
      bank_account_number: Sequelize.STRING,
      bank_branch: Sequelize.STRING,
      bank_ifsc: Sequelize.STRING,
      bank_name: Sequelize.STRING,
      company_name: Sequelize.STRING,
      status: { type: Sequelize.BOOLEAN, defaultValue: true },
      resetPasswordToken: Sequelize.STRING,
      resetPasswordTokenExpiry: Sequelize.DATE,
      is_deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
      role_id: {
        type: Sequelize.INTEGER,
        references: { model: 'tbl_user_roles', key: 'id' },
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    // tbl_users
    await queryInterface.createTable('tbl_users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      full_name: { type: Sequelize.STRING, allowNull: false },
      profile_image: Sequelize.STRING,
      email: { type: Sequelize.STRING, allowNull: false },
      contact_number: { type: Sequelize.STRING, allowNull: false },
      alternate_contact_number: Sequelize.STRING,
      pan_number: Sequelize.STRING,
      aadhaar_number: Sequelize.STRING,
      qualification: Sequelize.STRING,
      date_of_birth: Sequelize.DATE,
      pincode: Sequelize.STRING,
      district: Sequelize.STRING,
      taluk: Sequelize.STRING,
      village: Sequelize.STRING,
      address: Sequelize.STRING,
      bank_account_number: Sequelize.STRING,
      password: Sequelize.STRING,
      bank_ifsc: Sequelize.STRING,
      bank_name: Sequelize.STRING,
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tbl_user_roles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      reset_otp: Sequelize.STRING,
      reset_otp_expiration: Sequelize.DATE,
      bank_branch: Sequelize.STRING,
      created_by: Sequelize.INTEGER,
      status: { type: Sequelize.BOOLEAN, defaultValue: true },
      resetPasswordToken: Sequelize.STRING,
      resetPasswordTokenExpiry: Sequelize.DATE,
      vendor_id: {
        type: Sequelize.INTEGER,
        references: { model: 'tbl_vendors', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      is_deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
    });

    // tbl_document_types
    await queryInterface.createTable('tbl_document_types', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      description: Sequelize.STRING,
      status: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    // tbl_user_state_to_branch
    await queryInterface.createTable('tbl_user_state_to_branch', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false },
      state_id: { type: Sequelize.INTEGER, allowNull: false },
      division_id: { type: Sequelize.INTEGER, allowNull: false },
      district_id: { type: Sequelize.INTEGER, allowNull: false },
      taluk_id: { type: Sequelize.INTEGER, allowNull: false },
      branch_id: { type: Sequelize.INTEGER, allowNull: false },
      created_by: { type: Sequelize.INTEGER, allowNull: false },
      updated_by: { type: Sequelize.INTEGER, allowNull: false },
      status: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    // tbl_document_rejections_details
    await queryInterface.createTable('tbl_document_rejections_details', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      document_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tbl_documents', key: 'id' },
      },
      rejected_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tbl_users', key: 'id' },
      },
      issue_types: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
      },
      rejected_at: Sequelize.DATE,
      other_reasons: Sequelize.TEXT,
    });

    // tbl_document_feedbacks
    await queryInterface.createTable('tbl_document_feedbacks', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      document_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tbl_documents', key: 'id' },
      },
      message: Sequelize.TEXT,
      subject: Sequelize.STRING,
      feedback_for: Sequelize.STRING,
      vendor_id: { type: Sequelize.INTEGER, references: { model: 'tbl_vendors', key: 'id' } },
      squad_id: { type: Sequelize.INTEGER, references: { model: 'tbl_users', key: 'id' } },
      supervisor_id: { type: Sequelize.INTEGER, references: { model: 'tbl_users', key: 'id' } },
      uploader_id: { type: Sequelize.INTEGER, references: { model: 'tbl_users', key: 'id' } },
      status: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_by: { type: Sequelize.INTEGER, references: { model: 'tbl_users', key: 'id' } },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    // tbl_activities
    await queryInterface.createTable('tbl_activities', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      activity_title: { type: Sequelize.STRING, allowNull: false },
      activity_description: { type: Sequelize.TEXT, allowNull: false },
      activity_created_at: { type: Sequelize.DATE, allowNull: false },
      activity_created_by_id: { type: Sequelize.INTEGER, allowNull: false },
      activity_created_by_type: { type: Sequelize.STRING, allowNull: false },
      activity_document_id: { type: Sequelize.INTEGER, references: { model: 'tbl_documents', key: 'id' } },
      is_deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
    });

    // tbl_branches
    await queryInterface.createTable('tbl_branches', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      branch_code: Sequelize.STRING,
      address: Sequelize.STRING,
      pincode: Sequelize.STRING,
      taluk_id: { type: Sequelize.INTEGER, references: { model: 'tbl_taluks', key: 'id' } },
      created_by: { type: Sequelize.INTEGER, references: { model: 'tbl_users', key: 'id' } },
      status: { type: Sequelize.BOOLEAN, defaultValue: true },
      is_deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    // tbl_designations
    await queryInterface.createTable('tbl_designations', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      description: Sequelize.STRING,
      status: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    // tbl_divisions
    await queryInterface.createTable('tbl_divisions', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      state_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tbl_states', key: 'id' },
      },
      status: { type: Sequelize.BOOLEAN, defaultValue: true },
      is_deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    // tbl_districts
    await queryInterface.createTable('tbl_districts', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      division_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tbl_divisions', key: 'id' },
      },
      status: { type: Sequelize.BOOLEAN, defaultValue: true },
      is_deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('tbl_districts');
    await queryInterface.dropTable('tbl_divisions');
    await queryInterface.dropTable('tbl_designations');
    await queryInterface.dropTable('tbl_branches');
    await queryInterface.dropTable('tbl_activities');
    await queryInterface.dropTable('tbl_document_feedbacks');
    await queryInterface.dropTable('tbl_document_rejections_details');
    await queryInterface.dropTable('tbl_user_state_to_branch');
    await queryInterface.dropTable('tbl_document_types');
    await queryInterface.dropTable('tbl_users');
    await queryInterface.dropTable('tbl_vendors');
    await queryInterface.dropTable('tbl_user_roles');
  },
};
