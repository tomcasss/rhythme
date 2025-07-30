import Notification from "../models/notification.model.js";

export const createNotification = async ({ userId, type, message, postId = null }) => {
  try {
    const notif = new Notification({ userId, type, message, postId });
    return await notif.save();
  } catch (error) {
    throw error;
  }
};

export const getNotificationsByUser = async (userId) => {
  try {
    return await Notification.find({ userId }).sort({ createdAt: -1 });
  } catch (error) {
    throw error;
  }
};

export const markNotificationAsRead = async (id) => {
  try {
    return await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
  } catch (error) {
    throw error;
  }
};
