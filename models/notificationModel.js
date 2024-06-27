import { DataTypes } from 'sequelize';

const NotificationModel = (sequelize) => {
  const Notification = sequelize.define(
    'notifications',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      body: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      notification_sender_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      notification_sender_role: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      is_delete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "tbl_users", // name of the User table
          key: "id",
        },
      },
      notify_user_ids: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: [],
        allowNull: true,
      },
      notification_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'tbl_notifications',
      timestamps: true,
    }
  );
  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      foreignKey: "senderId",
      as: "user",
    });
  };
  return Notification;
};

export default NotificationModel;
