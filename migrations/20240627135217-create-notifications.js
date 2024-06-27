'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tbl_notifications', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      body: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      notification_sender_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      notification_sender_role: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      is_delete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      sender_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tbl_users', // name of the User table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      notify_user_ids: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: [],
        allowNull: true,
      },
      notification_type: {
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
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tbl_notifications');
  },
};
