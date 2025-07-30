import {
  createNotification,
  getNotificationsByUser,
  markNotificationAsRead
} from "../services/notification.service.js";

export const notifyUserController = async (req, res) => {
  try {
    const { userId, postId, message } = req.body;

    const notif = await createNotification({
      userId,
      postId,
      type: "post_reported",
      message: message || "Tu post ha sido reportado por infringir las normas, por favor, presta atención!.",
    });

    res.status(201).json(notif);
  } catch (error) {
    res.status(500).json({ error: "Error al enviar notificación." });
  }
};

export const getUserNotificationsController = async (req, res) => {
  try {
    const notifs = await getNotificationsByUser(req.params.userId);
    res.status(200).json(notifs);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener notificaciones." });
  }
};

export const markAsReadController = async (req, res) => {
  try {
    const notif = await markNotificationAsRead(req.params.id);
    res.status(200).json(notif);
  } catch (error) {
    res.status(500).json({ error: "Error al marcar como leída." });
  }
};
