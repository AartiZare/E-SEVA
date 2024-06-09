'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('documents', 'supervisor_verification_status', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });

    await queryInterface.addColumn('documents', 'squad_verification_status', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });

    await queryInterface.addColumn('documents', 'final_verification_status', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });

    await queryInterface.sequelize.query('COMMENT ON COLUMN "documents"."supervisor_verification_status" IS \'0 - Pending, 1 - Approved, 2 - Rejected\'');
    await queryInterface.sequelize.query('COMMENT ON COLUMN "documents"."squad_verification_status" IS \'0 - Pending, 1 - Approved, 2 - Rejected\'');
    await queryInterface.sequelize.query('COMMENT ON COLUMN "documents"."final_verification_status" IS \'0 - Pending, 1 - Approved, 2 - Rejected\'');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('documents', 'supervisor_verification_status');
    await queryInterface.removeColumn('documents', 'squad_verification_status');
    await queryInterface.removeColumn('documents', 'final_verification_status');
  }
};