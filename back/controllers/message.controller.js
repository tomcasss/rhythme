import User from "../models/user.model.js";
import { sendMail } from "../utils/mailer.js";
import { newMessageTemplate } from "../utils/emailTemplates.js";
import { listMessages, sendMessage } from "../services/message.service.js";

export const listMessagesController = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 30, before } = req.query;
    const data = await listMessages(conversationId, { limit: +limit, before });
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error getting messages" });
  }
};

export const sendMessageController = async (req, res) => {
  try {
    const { conversationId, senderId, sender, text, peerId } = req.body;
    // support both "senderId" and legacy "sender" from front
    const sid = senderId || sender;
    const msg = await sendMessage({
      conversationId,
      senderId: sid,
      text,
      peerId,
    });

    // Emit socket event to both participants
    try {
      const io = req.app.get("io");
      if (io) {
        const senderRoom = `user:${(
          msg.senderId?.toString?.() ||
          sid ||
          ""
        ).toString()}`;
        const rawPeer = peerId || msg.peerId;
        const peerRoom = rawPeer
          ? `user:${rawPeer?.toString?.() || String(rawPeer)}`
          : undefined;
        const payload = {
          _id: msg._id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          text: msg.text,
          createdAt: msg.createdAt,
        };
        io.to(senderRoom).emit("message:new", payload);
        if (peerRoom) io.to(peerRoom).emit("message:new", payload);
      }
    } catch (e) {
      console.error("Socket emit failed:", e);
    }
    // Enviar notificiacion de email
    try {
      if (String(msg.senderId) !== String(msg.peerId || req.body.peerId)) {
        if (
          String(process.env.EMAIL_ENABLED).toLowerCase() === "true" &&
          String(process.env.EMAIL_NOTIF_MESSAGES).toLowerCase() === "true"
        ) {
          const FRONT = process.env.FRONT_BASE_URL || "http://localhost:5173";

          const recipient = await User.findById(
            msg.peerId || req.body.peerId
          ).select("email username");
          const sender = await User.findById(msg.senderId).select("username");
          if (recipient?.email) {
            const tpl = newMessageTemplate({
              recipient,
              sender,
              text: msg.text,
            });

            setImmediate(async () => {
              try {
                await sendMail({ to: recipient.email, ...tpl });
              } catch (e) {
                console.error("Envio de correo fallido (mensaje):", e);
              }
            });
          }
        }
      }
    } catch (error) {
      console.log("❌ Error al enviar email de notificación:", error);
    }

    res.status(201).json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending message" });
  }
};
