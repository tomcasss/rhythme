import {
  listMessages,
  sendMessage,
} from "../services/message.service.js";

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
    const msg = await sendMessage({ conversationId, senderId: sid, text, peerId });

    // Emit socket event to both participants
    try {
      const io = req.app.get('io');
      if (io) {
        const roomA = `user:${msg.senderId?.toString?.() || sid}`;
        const roomB = peerId ? `user:${peerId}` : undefined;
        const payload = {
          _id: msg._id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          text: msg.text,
          createdAt: msg.createdAt,
        };
        io.to(roomA).emit('message:new', payload);
        if (roomB) io.to(roomB).emit('message:new', payload);
      }
    } catch (e) {
      console.error('Socket emit failed:', e);
    }

    res.status(201).json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending message" });
  }
};
