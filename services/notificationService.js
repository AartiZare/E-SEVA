import db from "../models/index.js";
const Notification = db.Notification;
// Get notification by ID
export async function getNotificationById(id) {
  return Notification.findByPk(id);
}

// Get list of notifications based on filter
export async function getNotificationList(filter) {
  return Notification.findAll({
    where: {
      notify_user_ids: {
        [sequelize.Op.contains]: [filter.notificationId] // Assuming sequelize.Op is imported
      },
      is_delete: false,
    },
    order: [['created_at', 'DESC']],
  });
}

// Get list of notifications after updating
export async function getNotificationListAfterUpdate(filter) {
  return Notification.findAll({
    where: {
      notify_user_ids: {
        [sequelize.Op.contains]: [filter.notificationId]
      },
    },
    order: [['created_at', 'DESC']],
  });
}

// Get all notifications based on filter
export async function getAllNotification(filter) {
  return Notification.findAll(filter);
}

// Get paginated list of notifications
export async function getNotificationListWithPagination(filter, option) {
  return Notification.findAndCountAll({
    where: filter,
    ...option,
  });
}

// Create a new notification
export async function createNotification(body) {
  return Notification.create(body);
}

// Update a notification
export async function updateNotification(filter, body) {
  const notification = await Notification.findOne({
    where: filter,
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  return notification.update(body);
}

// Update multiple notifications
export async function updateManyNotification(filter, body) {
  return Notification.update(body, {
    where: filter,
  });
}

// Delete a notification
export async function deleteNotification(id) {
  const notification = await Notification.findByPk(id);

  if (!notification) {
    throw new Error('Notification not found');
  }

  return notification.destroy();
}
