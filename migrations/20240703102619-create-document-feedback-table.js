'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tbl_document_feedbacks', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      document_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tbl_documents', // Name of the Document table
          key: 'id',
        },
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      feedback_for: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      vendor_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tbl_vendors', // Name of the Vendor table
          key: 'id',
        },
      },
      squad_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tbl_users', // Name of the Users table (Squad ID)
          key: 'id',
        },
      },
      supervisor_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tbl_users', // Name of the Users table (Supervisor ID)
          key: 'id',
        },
      },
      uploader_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tbl_users', // Name of the Users table (Uploader ID)
          key: 'id',
        },
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tbl_users', // Name of the Users table (Creator of the Feedback)
          key: 'id',
        },
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tbl_document_feedbacks');
  },
};
